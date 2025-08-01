import { verifyToken } from '../../lib/jwt.mjs';
import { triggerWebhook } from '../../lib/webhook.mjs'; // 可选：仅当你希望验证成功后通知外部系统

const VERIFY_REDIRECT_URL = process.env.VERIFY_REDIRECT_URL || '/verify-success.html';

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed, use GET' }),
    };
  }

  const { token } = event.queryStringParameters || {};

  if (!token) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing token parameter' }),
    };
  }

  try {
    // 1. 校验 token
    const payload = verifyToken(token); // throws on failure
    const { email } = payload || {};

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid token payload: missing email' }),
      };
    }

    // 2. 可选：通知 Webhook 验证已完成（例如 Zapier）
    if (process.env.WEBHOOK_URL) {
      await triggerWebhook({
        type: 'email_verified',
        email,
        verified: true,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. 重定向至验证成功页面
    return {
      statusCode: 302,
      headers: {
        Location: VERIFY_REDIRECT_URL,
        'Access-Control-Allow-Origin': '*',
      },
      body: '',
    };
  } catch (err) {
    console.error('[verify-email] Error:', err);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid or expired token' }),
    };
  }
} 