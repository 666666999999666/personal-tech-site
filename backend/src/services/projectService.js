// 内存存储 - Phase 4 丰富的项目数据
let projects = [
  {
    id: '1',
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
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
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
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: '3',
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
    createdAt: '2024-05-01T00:00:00Z',
  },
  {
    id: '4',
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
    createdAt: '2024-06-01T00:00:00Z',
  },
];
let nextId = 5;

const projectService = {
  getAll: () => projects,

  getById: (id) => projects.find(p => p.id === id) || null,

  create: (data) => {
    const project = {
      id: String(nextId++),
      ...data,
      createdAt: new Date().toISOString(),
    };
    projects.push(project);
    return project;
  },

  update: (id, data) => {
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    projects[index] = { ...projects[index], ...data, id };
    return projects[index];
  },

  remove: (id) => {
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return false;
    projects.splice(index, 1);
    return true;
  },
};

module.exports = projectService;
