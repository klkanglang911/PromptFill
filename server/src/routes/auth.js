import { Router } from 'express';
import bcrypt from 'bcrypt';
import { getUserByEmail, createUser, getUserById } from '../models/db.js';

const router = Router();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '邮箱和密码不能为空'
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: '邮箱格式不正确'
      });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: '密码长度至少6位'
      });
    }

    // 检查邮箱是否已存在
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '该邮箱已被注册'
      });
    }

    // 创建用户
    const passwordHash = await bcrypt.hash(password, 10);
    const user = createUser(email, passwordHash, nickname || email.split('@')[0]);

    // 设置 session
    req.session.user = {
      id: user.id,
      email: user.email,
      nickname: user.nickname
    };

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: '注册失败，请重试'
    });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '邮箱和密码不能为空'
      });
    }

    // 查找用户
    const user = getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      });
    }

    // 设置 session
    req.session.user = {
      id: user.id,
      email: user.email,
      nickname: user.nickname
    };

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: '登录失败，请重试'
    });
  }
});

// 登出
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: '登出失败'
      });
    }
    res.json({ success: true });
  });
});

// 获取当前用户信息
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      error: '未登录'
    });
  }

  const user = getUserById(req.session.user.id);
  if (!user) {
    req.session.destroy();
    return res.status(401).json({
      success: false,
      error: '用户不存在'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar_url: user.avatar_url
    }
  });
});

export default router;
