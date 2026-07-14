// 数据迁移脚本：把示例数据写入 MongoDB
// 运行方式：node src/scripts/seed.js
// 类比 Java Spring: 相当于 data.sql 初始化数据
require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const Project = require('../models/Project');

// 示例博客数据（从原 blogService.js 迁移）
const blogs = [
  {
    title: '构建自定义 React Router',
    content: `# 构建自定义 React Router

## 为什么需要 Router

传统多页应用：每个 URL 对应一个 HTML 文件，浏览器直接请求服务器获取页面。

SPA 单页应用：只有一个 HTML 文件，URL 变化时**不请求新页面**，而是通过 JS 动态替换内容。

## 浏览器 History 机制

\`\`\`javascript
// 改 URL，不刷新，压入历史栈
window.history.pushState(state, title, url)

// 改 URL，不刷新，替换当前条目
window.history.replaceState(state, title, url)

// 用户点前进/后退时触发
window.onpopstate
\`\`\`

## 核心实现

使用 **发布-订阅模式** 通知组件切换：

\`\`\`javascript
class Router {
  push(path) {
    window.history.pushState({}, '', path)
    this._matchAndNotify(path)
  }

  subscribe(listener) {
    this.listeners.push(listener)
    return () => { /* 取消订阅 */ }
  }
}
\`\`\`

## 类比 Java

| 本项目 | Java/Spring |
|--------|-------------|
| Custom Router | DispatcherServlet + @RequestMapping |
| 路径匹配 | 正则表达式匹配 |
| 参数提取 | 类似 @PathVariable |

## 总结

手写 Router 的核心价值在于理解 **SPA 路由的本质**：URL 和组件渲染的同步机制。`,
    tags: ['React', 'Router', '前端架构'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    title: '自定义状态管理 Store 原理',
    content: `# 自定义状态管理 Store 原理

## 为什么需要状态管理

React 组件的状态（useState）是**组件内部**的。当多个组件需要共享同一份数据时：

- 每个组件自己 fetch → 数据重复、请求重复、状态不一致
- 通过 props 层层传递 → "prop drilling" 地狱

## 发布-订阅模式

\`\`\`javascript
function createStore(initialState) {
  let state = { ...initialState }
  const listeners = new Set()

  function setState(partial) {
    state = { ...state, ...partial }
    listeners.forEach(fn => fn(state))
  }

  function subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return { getState, setState, subscribe }
}
\`\`\`

## 与 Redux 对比

| 特性 | Redux | 自定义 Store |
|------|-------|-------------|
| 学习成本 | 高（Action/Reducer/Store） | 低（直接 setState） |
| 代码量 | 多 | 少（~30行） |
| 适用场景 | 大型应用 | 中小型应用/学习 |

## 面试表达

> "我手写了状态管理，采用 Zustand 风格的发布-订阅模式，支持 getState/setState/subscribe，浅比较避免不必要的通知。"`,
    tags: ['React', 'State Management', '设计模式'],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    title: 'RESTful API 设计最佳实践',
    content: `# RESTful API 设计最佳实践

## 核心原则

1. **资源导向**：URL 表示资源，而非动作
2. **HTTP 动词**：GET/POST/PUT/DELETE 表示操作
3. **状态码**：200/201/400/404/500 语义明确

## 设计示例

\`\`\`
GET    /api/blog        → 获取博客列表
POST   /api/blog        → 创建博客
GET    /api/blog/:id    → 获取单篇博客
PUT    /api/blog/:id    → 更新博客
DELETE /api/blog/:id    → 删除博客
\`\`\`

## 分层架构

\`\`\`
Express Router → Controller → Service → Model
\`\`\`

## 类比 Java

| 本项目 | Java/Spring |
|--------|-------------|
| Express Router | @Controller + @RequestMapping |
| Controller | @RestController |
| Service | @Service |
| Model (Mongoose) | @Entity + JpaRepository |`,
    tags: ['API', 'Express', '后端设计'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

// 示例项目数据（从原 projectService.js 迁移）
const projects = [
  {
    name: '个人技术网站',
    description: '基于 React + Vite + Express 的全栈项目，从零手写 Router、Store、API 层，深入理解现代 Web 工程化思想。',
    longDescription: `## 项目背景

本项目是一个完整的个人技术网站，目标是理解现代 Web 全栈工程思想。

## 技术架构

- **前端**: React 19 + Vite + 自定义 Router/Store
- **后端**: Express + 分层架构 (Controller/Service/Model)
- **部署**: Docker + Nginx + HTTPS

## 核心亮点

1. 手写 Router（history API + 发布订阅）
2. 手写 Store（Zustand 风格发布订阅）
3. 手写 API 层（fetch 封装）
4. 粒子背景 + 打字机动画 + 滚动动画`,
    techStack: ['React', 'Vite', 'Express', 'MongoDB', 'Node.js'],
    githubUrl: 'https://github.com/xxx/personal-site',
    demoUrl: 'https://example.com',
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    name: 'AI Agent 智能助手',
    description: '基于大语言模型的智能 Agent 系统，支持流式通信、工具调用和记忆管理。',
    longDescription: `## 项目背景

构建一个可扩展的 AI Agent 系统，支持多种 LLM  provider 和工具调用。

## 核心功能

- 流式 SSE 通信
- 工具调用 (Tool Calling)
- 记忆管理 (Memory)
- 多 Agent 协作

## 技术栈

- OpenAI / Claude API
- SSE (Server-Sent Events)
- Express + Node.js`,
    techStack: ['AI', 'LLM', 'Node.js', 'Express', 'SSE'],
    githubUrl: 'https://github.com/xxx/ai-agent',
    demoUrl: null,
    featured: true,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
  {
    name: '实时数据可视化平台',
    description: '高性能实时数据处理与可视化平台，支持 WebSocket 和 SSE 流式推送。',
    longDescription: `## 项目背景

企业级实时数据监控平台，支持每秒万级数据点的实时渲染。

## 核心功能

- WebSocket 实时通信
- 大数据量图表渲染
- 数据缓存与降采样
- 多维度数据筛选

## 技术栈

- React + D3.js + Canvas
- WebSocket + Redis
- Node.js + Express`,
    techStack: ['React', 'WebSocket', 'D3.js', 'Redis', 'Node.js'],
    githubUrl: 'https://github.com/xxx/realtime-data',
    demoUrl: 'https://demo.example.com',
    featured: false,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01'),
  },
  {
    name: '微服务网关系统',
    description: '基于 Node.js 的高性能 API 网关，支持路由转发、限流、鉴权等功能。',
    longDescription: `## 项目背景

为微服务架构设计的统一入口网关。

## 核心功能

- 动态路由转发
- 流量控制与熔断
- JWT 鉴权
- 请求/响应日志

## 技术栈

- Node.js + Express
- Redis (限流)
- JWT (鉴权)`,
    techStack: ['Node.js', 'Express', 'Redis', 'Docker', 'Nginx'],
    githubUrl: 'https://github.com/xxx/api-gateway',
    demoUrl: null,
    featured: false,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/personal_tech_site';
  await mongoose.connect(uri);
  console.log('已连接 MongoDB:', uri);

  // 先清空集合（避免重复运行导致数据重复）
  await Blog.deleteMany({});
  await Project.deleteMany({});
  console.log('已清空 Blog 和 Project 集合');

  // 插入示例数据
  await Blog.insertMany(blogs);
  await Project.insertMany(projects);
  console.log(`已插入 ${blogs.length} 篇博客，${projects.length} 个项目`);

  await mongoose.disconnect();
  console.log('数据迁移完成，已断开连接');
}

// 只有直接运行（node src/scripts/seed.js）时才执行，被 require 时不自动执行
if (require.main === module) {
  seed().catch((err) => {
    console.error('迁移失败:', err);
    process.exit(1);
  });
}

module.exports = seed;
