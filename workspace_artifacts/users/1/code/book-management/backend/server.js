/**
 * 图书管理系统 - 后端服务
 * 使用 Node.js + Express + SQLite
 * 端口：3000
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 引入路由
const booksRouter = require('./routes/books');
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== 安全中间件 ==========
// 防止 XSS 攻击
app.use(helmet());
// CORS 跨域支持
app.use(cors());
// 请求体解析
app.use(express.json());
// 请求体大小限制（防止恶意大请求）
app.use(express.json({ limit: '10kb' }));

// ========== 限流中间件 ==========
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个 IP 最多 100 请求
  message: { error: '请求过于频繁，请稍后再试' }
});
app.use('/api/', apiLimiter);

// ========== 日志中间件 ==========
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms`);
  });
  next();
});

// ========== 路由配置 ==========
app.use('/api/books', booksRouter);
app.use('/api/health', healthRouter);

// ========== 404 处理 ==========
app.use((req, res) => {
  res.status(404).json({ error: '请求的资源不存在' });
});

// ========== 错误处理 ==========
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// ========== 启动服务器 ==========
app.listen(PORT, () => {
  console.log(`🚀 图书管理系统后端服务已启动`);
  console.log(`   端口: ${PORT}`);
  console.log(`   环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   健康检查: http://localhost:${PORT}/api/health`);
});

module.exports = app;