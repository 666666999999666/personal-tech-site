// 加载环境变量（必须最先加载，让后续 require 的模块能读到 process.env）
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// CORS 配置：生产环境应限制来源
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));

// JSON 解析中间件
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// 路由
const blogRoutes = require('./routes/blog');
const projectRoutes = require('./routes/project');
const agentRoutes = require('./routes/agent');

app.use('/api/blogs', blogRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/agent', agentRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use('/api', (req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  // 生产环境不暴露错误详情
  const message = process.env.NODE_ENV === 'production'
    ? '服务器内部错误'
    : err.message;
  res.status(500).json({ message });
});

const PORT = process.env.PORT || 3001;

// 先连接数据库，连上后再启动 HTTP 服务（避免后端空转）
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

module.exports = app;
