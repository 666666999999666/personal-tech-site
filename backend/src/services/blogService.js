// 内存存储，Phase 3 使用更丰富的 Markdown 内容
let blogs = [
  {
    id: '1',
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
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
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

> "我手写了状态管理，采用 Zustand 风格的发布-订阅模式，支持 getState/setState/subscribe，浅比较避免不必要的通知。",`,
    tags: ['React', 'State Management', '设计模式'],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
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
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
];
let nextId = 4;

const blogService = {
  getAll: () => blogs,

  getById: (id) => blogs.find((b) => b.id === id),

  create: (data) => {
    const blog = {
      id: String(nextId++),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    blogs.push(blog);
    return blog;
  },

  update: (id, data) => {
    const index = blogs.findIndex((b) => b.id === id);
    if (index === -1) return null;
    blogs[index] = { ...blogs[index], ...data, updatedAt: new Date().toISOString() };
    return blogs[index];
  },

  remove: (id) => {
    const index = blogs.findIndex((b) => b.id === id);
    if (index === -1) return false;
    blogs.splice(index, 1);
    return true;
  },
};

module.exports = blogService;
