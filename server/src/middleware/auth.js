import bcrypt from 'bcrypt';
import { getAdminByUsername } from '../models/db.js';

/**
 * 验证管理员登录
 */
export async function validateAdmin(username, password) {
  const admin = getAdminByUsername(username);
  if (!admin) {
    return null;
  }

  const isValid = await bcrypt.compare(password, admin.password_hash);
  if (!isValid) {
    return null;
  }

  return {
    id: admin.id,
    username: admin.username
  };
}

/**
 * 要求管理员登录的中间件
 */
export function requireAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }

  // 如果是 AJAX 请求，返回 JSON
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ error: '需要登录' });
  }

  // 否则重定向到登录页
  res.redirect('/admin/login');
}

/**
 * 如果已登录则跳过（用于登录页）
 */
export function skipIfAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return res.redirect('/admin');
  }
  next();
}
