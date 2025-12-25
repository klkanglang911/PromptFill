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

/**
 * 要求用户登录的中间件
 */
export function requireUser(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: '需要登录'
  });
}

/**
 * 可选用户登录（用于同时支持登录和匿名用户的接口）
 */
export function optionalUser(req, res, next) {
  // 不做任何检查，直接继续
  // 用户信息可以从 req.session.user 获取
  next();
}
