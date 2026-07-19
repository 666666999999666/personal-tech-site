import { db } from "./index";
import { posts, projects } from "./schema";

async function seed() {
  console.log("Seeding database...");

  // === 博客文章 ===
  const blogPosts = await db.insert(posts).values([
    {
      slug: "nextjs-15-getting-started",
      title: "Next.js 15 入门指南",
      contentMd: `## 简介

Next.js 15 为 React 生态带来了令人兴奋的新特性。在这篇文章中，我们将探索关键变化以及如何快速上手。

## App Router

App Router 现已成为 Next.js 的默认路由系统，它支持：

- 默认使用 **Server Components**
- **Streaming** 和 **Suspense** 支持
- 保持状态的 **Layouts**

### 创建路由

要创建路由，只需在 \`app\` 目录下添加 \`page.tsx\` 文件：

\`\`\`tsx
export default function Page() {
  return <h1>你好，世界！</h1>;
}
\`\`\`

## Server Components

Server Components 允许你在服务端渲染组件，减少发送到客户端的 JavaScript 体积。

> [!tip] Server Components 是 App Router 的默认模式。你需要使用 "use client" 来启用客户端组件。

## 总结

Next.js 15 是 React 开发的重大进步。今天就开始构建吧！`,
      excerpt: "学习如何使用 Next.js 15 和 App Router 构建现代 Web 应用。",
      tags: ["Next.js", "React", "Web 开发"],
      category: "教程",
      status: "published",
      publishedAt: new Date("2025-01-15"),
      readingTimeMinutes: 5,
    },
    {
      slug: "understanding-react-server-components",
      title: "深入理解 React Server Components",
      contentMd: `## 什么是 Server Components？

React Server Components（RSC）是 React 的一种新组件类型，它在服务器上渲染，不会向客户端发送任何 JavaScript。

## 核心优势

1. **零客户端 JS** — Server Components 的代码不会被打包到客户端 bundle
2. **直接访问后端** — 可以直接查询数据库、读取文件系统
3. **自动代码分割** — 客户端组件自动按需加载

## 何时使用 Server vs Client 组件

| 场景 | 推荐类型 |
|------|----------|
| 获取数据 | Server |
| 访问后端资源 | Server |
| 交互（点击、输入） | Client |
| 使用浏览器 API | Client |
| 使用状态（useState） | Client |

## 最佳实践

- 默认使用 Server Components
- 只在需要交互时才切换到 Client Components
- 将 Client Components 推到组件树的最底部

> [!warning] 不要在 Server Components 中使用 useState、useEffect 等 Hook。

## 总结

RSC 代表了 React 应用的未来方向。理解何时使用 Server 和 Client 组件是构建高性能应用的关键。`,
      excerpt: "深入探讨 React Server Components 如何改变我们构建 React 应用的方式。",
      tags: ["React", "RSC"],
      category: "深度解析",
      status: "published",
      publishedAt: new Date("2025-01-10"),
      readingTimeMinutes: 8,
    },
    {
      slug: "tailwind-css-v4-new-features",
      title: "Tailwind CSS v4 新特性一览",
      contentMd: `## 概述

Tailwind CSS v4 带来了全新的引擎和大量改进，让 CSS 开发体验更上一层楼。

## 主要变化

### 1. 全新引擎

基于 Rust 重写的引擎，构建速度提升 10 倍以上。

### 2. CSS 优先配置

不再需要 \`tailwind.config.js\`，直接在 CSS 中配置：

\`\`\`css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --font-sans: "Inter", sans-serif;
}
\`\`\`

### 3. 自动内容检测

无需配置 \`content\` 数组，自动检测项目中的类名使用。

### 4. 容器查询支持

原生支持容器查询：

\`\`\`html
<div class="@lg:flex-row">
  <!-- 在容器宽度 >= 32rem 时切换为横向布局 -->
</div>
\`\`\`

## 迁移指南

大部分现有代码无需修改，只需更新依赖即可：

\`\`\`bash
npm install tailwindcss@4
\`\`\`

## 总结

Tailwind CSS v4 是一次全面的升级，新引擎 + CSS 优先的配置方式让开发体验大幅提升。`,
      excerpt: "探索 Tailwind CSS v4 的新功能和改进。",
      tags: ["CSS", "Tailwind"],
      category: "前端",
      status: "published",
      publishedAt: new Date("2025-01-05"),
      readingTimeMinutes: 4,
    },
    {
      slug: "docker-deployment-guide",
      title: "Docker 部署 Next.js 实战指南",
      contentMd: `## 为什么用 Docker？

Docker 让你的应用在任何环境中都能一致运行——开发、测试、生产，一套配置搞定。

## 基础 Dockerfile

\`\`\`dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

## Docker Compose 编排

结合 PostgreSQL 和 Nginx 的完整编排方案。

## 总结

Docker 部署让运维变得简单可重复，是现代 Web 应用的标配。`,
      excerpt: "从 Dockerfile 到 Docker Compose，完整讲解如何用 Docker 部署 Next.js 应用。",
      tags: ["Docker", "Next.js", "DevOps"],
      category: "教程",
      status: "published",
      publishedAt: new Date("2025-02-01"),
      readingTimeMinutes: 6,
    },
    {
      slug: "typescript-type-gymnastics",
      title: "TypeScript 类型体操：从入门到实践",
      contentMd: `## 前言

TypeScript 的类型系统图灵完备，可以做很多有趣的事情。本文带你从基础到进阶。

## 基础工具类型

\`\`\`typescript
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Partial<T> = { [P in keyof T]?: T[P] };
type Record<K extends string, T> = { [P in K]: T };
\`\`\`

## 条件类型

\`\`\`typescript
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">; // true
type B = IsString<42>;      // false
\`\`\`

## 总结

类型体操虽然强大，但要在可读性和复杂性之间找到平衡。实践中优先保证代码清晰易懂。`,
      excerpt: "深入 TypeScript 类型系统，掌握条件类型、映射类型等高级技巧。",
      tags: ["TypeScript", "前端"],
      category: "前端",
      status: "published",
      publishedAt: new Date("2025-02-15"),
      readingTimeMinutes: 10,
    },
  ]).returning();

  console.log(`Created ${blogPosts.length} blog posts`);

  // === 项目 ===
  const projectList = await db.insert(projects).values([
    {
      slug: "personal-site-v2",
      title: "个人网站 V2",
      description: "本站——一个基于 Next.js、Tailwind CSS v4、PostgreSQL 等技术构建的 Agent Native 个人网站。",
      contentMd: `# 个人网站 V2

一个现代化的个人网站，采用 Agent Native 架构构建。

## 技术栈

- **Next.js 15** — App Router + Server Components
- **Tailwind CSS v4** — 原子化 CSS
- **PostgreSQL** — 数据存储
- **Drizzle ORM** — 类型安全的数据库操作
- **Docker Compose** — 容器化部署

## 功能

- 博客系统（TipTap 编辑器 + Markdown 渲染）
- 个人工作空间（Todo 管理 + AI Agent）
- 中英双语支持
- 暗色/亮色主题`,
      tags: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
      status: "published",
      sortOrder: 1,
      repoUrl: "https://github.com/666666999999666",
      demoUrl: "/",
    },
    {
      slug: "cli-devtool",
      title: "CLI 开发工具集",
      description: "一套命令行开发工具，自动化常见开发任务，提升工作效率。",
      contentMd: `# CLI 开发工具集

一套实用的命令行工具，帮助开发者自动化日常任务。

## 功能

- 项目脚手架生成
- 代码格式化与 lint 检查
- Git 工作流辅助
- 数据库迁移管理

## 技术选型

- **Rust** — 高性能与可靠性
- **Clap** — 命令行参数解析
- **Tokio** — 异步运行时`,
      tags: ["Rust", "CLI"],
      status: "published",
      sortOrder: 2,
      repoUrl: "https://github.com/666666999999666",
    },
  ]).returning();

  console.log(`Created ${projectList.length} projects`);
  console.log("Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
