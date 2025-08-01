// lib/resend.js - 正式版，调用 Resend API 发送邮件


import fetch from 'node-fetch';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;

if (!RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY in environment variables');
}
if (!FROM_EMAIL) {
  throw new Error('Missing FROM_EMAIL in environment variables');
}

/**
 * 发送 HTML 邮件（通过 Resend API）
 * @param {Object} options
 * @param {string} options.to - 收件人邮箱
 * @param {string} options.subject - 邮件主题
 * @param {string} options.html - 邮件 HTML 内容
 * @param {string} [options.from] - 发件人（默认使用 env 中的 FROM_EMAIL）
 */
export async function sendEmail({ to, subject, html, from = FROM_EMAIL }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error('[Resend] Send failed:', text);
    throw new Error(`Resend API error: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return { message: 'Email sent, but failed to parse response', raw: text };
  }
}

/**
 * 发送用于邮箱验证的邮件（保留，如需）
 */
export async function sendVerificationEmail({ to, subject, html }) {
  return sendEmail({ to, subject, html });
}

/**
 * 发送“合作意向确认”邮件
 * @param {Object} options
 * @param {string} options.to - 收件人邮箱
 * @param {string} [options.name] - 用户称呼名
 */
export async function sendConfirmationEmail({ to, name }) {
  const html = `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
      <p>您好${name ? `，${name}` : ''}：</p>

      <p>我们已成功收到您提交的合作意向，感谢您对 <strong>R winSaaS 系统数字化 & 自动化升级合作</strong> 的关注！</p>

      <p>您可以直接通过本邮箱与我们保持联系，我们非常欢迎进一步了解您的需求与合作设想。</p>

      <p>如有任何补充信息，也可直接回复此邮件，我们会尽快处理并跟进。</p>

      <p>感谢您的信任与支持，期待与您建立长期合作关系。</p>

      <p style="margin-top: 2em;">— R winSaaS 系统 团队</p>

      <p style="font-size: 14px; color: #777; margin-top: 2em;">
        此邮件由系统自动发出，但我们会认真阅读您的每一次回复。<br />
        您的来信将由创始团队直接接收与跟进。
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: '🎉 我们已收到您的合作意向 - R winSaaS 创始团队',
    html,
  });


} 