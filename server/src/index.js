import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

import apiRoutes from './routes/api.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import uploadRoutes from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 信任代理（Nginx）
app.set('trust proxy', 1);

// 中间件
app.use(helmet({
  contentSecurityPolicy: false, // 允许加载外部资源
}));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session 配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'promptfill-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true', // 仅在明确设置时启用 HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    sameSite: 'lax'
  }
}));

// 模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静态文件服务（上传的图片）
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// API 路由
app.use('/api', apiRoutes);

// 用户认证路由
app.use('/api/auth', authRoutes);

// 用户数据路由
app.use('/api/user', userRoutes);

// 图片上传路由
app.use('/api/upload', uploadRoutes);

// 管理后台路由
app.use('/admin', adminRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? '服务器错误' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PromptFill Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
});

export default app;
