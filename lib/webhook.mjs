// lib/webhook.mjs
import fetch from 'node-fetch';

const WEBHOOK_URL = process.env.WEBHOOK_URL || '';

/**
 * 触发 Zapier Webhook
 * @param {Object} payload - 要发送的数据对象，会被转为 JSON 发送
 * @returns {Promise<Object>} - 返回 Zapier 的响应 JSON
 */
export async function triggerWebhook(payload) {
  if (!WEBHOOK_URL) {
    console.warn('[webhook] WEBHOOK_URL 未配置，跳过调用');
    return null;
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Webhook 请求失败，状态码 ${response.status}，响应：${text}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('[webhook] 调用失败:', error);
    throw error;
  }

} 