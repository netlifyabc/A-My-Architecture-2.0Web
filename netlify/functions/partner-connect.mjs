import { createToken } from '../../lib/jwt.mjs';
import { sendVerificationEmail } from '../../lib/resend.mjs';
import { triggerWebhook } from '../../lib/webhook.mjs'; // 可选：你可先空函数处理

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGINS?.split(',')[0] || '*';

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { email, name = '' } = JSON.parse(event.body || '{}');

    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '请输入有效邮箱' }),
      };
    }

    // 1. 生成邮箱验证 Token
    const token = createToken({ email });

    // 2. 构造验证链接
    const redirectURL = process.env.VERIFY_REDIRECT_URL || 'https://yourdomain.com/verify-success.html';
    const verifyLink = `${redirectURL}?token=${encodeURIComponent(token)}`;

    // 3. 发送验证邮件
    await sendVerificationEmail({
      to: email,
      link: verifyLink,
      name,
    });

    // 4. 可选：触发 Webhook（Zapier / Slack / Airtable）
    if (process.env.WEBHOOK_URL) {
      await triggerWebhook({
        email,
        name,
        type: 'partner_connect',
        verified: false,
        timestamp: new Date().toISOString(),
      });
    }

    // 5. 响应成功
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: '验证邮件已发送',
        email,
      }),
    };

  } catch (error) {
    console.error('[partner-connect] Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '服务器错误',
        message: error.message,
      }),
    };
  }
}


