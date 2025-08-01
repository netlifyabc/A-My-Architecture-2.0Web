import { createToken } from '../../lib/jwt.mjs';
import { sendVerificationEmail } from '../../lib/resend.mjs';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGINS?.split(',')[0] || '*';
const VERIFY_REDIRECT_URL = process.env.VERIFY_REDIRECT_URL;
const FROM_EMAIL = process.env.FROM_EMAIL;

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
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

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing email field' }),
      };
    }

    // 重发 token，只包含 email
    const token = createToken({ email });
    const verifyUrl = `${VERIFY_REDIRECT_URL}?token=${encodeURIComponent(token)}`;

    const html = `
      <p>Hi ${name || ''},</p>
      <p>这是你请求的邮箱验证链接，请点击以下链接完成验证：</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>链接 7 天内有效。</p>
    `;

    await sendVerificationEmail({
      from: FROM_EMAIL,
      to: email,
      subject: '重新发送：请验证你的邮箱',
      html,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Verification email resent' }),
    };
  } catch (error) {
    console.error('[resend-verification] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
    };
  }
} 


