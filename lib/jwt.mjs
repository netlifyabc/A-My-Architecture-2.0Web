// netlify/functions/jwt.mjs 

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * 生成 JWT（默认过期 7 天）
 * @param {Object} payload - 要编码的对象
 * @param {string|number} [expiresIn='7d'] - 过期时间
 * @returns {string} JWT 字符串
 */
export function createToken(payload = {}, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * 验证 JWT，验证失败会抛出异常（由调用方捕获）
 * @param {string} token - 要验证的 JWT
 * @returns {Object} 解码后的 payload
 * @throws {Error} token 无效或已过期
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET); // 让上层 catch 错误


} 