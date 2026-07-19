# QZ Site — 个人网站 V2

一个基于 Agent Native 理念构建的个人网站，支持博客写作、待办管理、AI Agent 对话。

## 技术栈

- **Next.js 16** — App Router + Server Components
- **Tailwind CSS v4** — 原子化 CSS
- **PostgreSQL** — 数据存储
- **Drizzle ORM** — 类型安全的数据库操作
- **NextAuth v5** — 密码认证
- **TipTap** — 富文本编辑器
- **next-intl** — 中英双语国际化

## 功能

- 📝 博客系统 — TipTap 编辑器 + Markdown 渲染 + 分类/搜索
- ✅ 待办管理 — 分区管理 + 拖拽排序 + 数据库持久化
- 🤖 AI Agent — 对话式交互 + 工具调用
- 🔒 认证系统 — 密码登录 + 受保护的个人空间
- 🌐 国际化 — 中英双语
- 🎨 主题切换 — 亮色/暗色

## 开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库连接等信息

# 创建数据库表
npm run db:push

# 导入种子数据
npm run db:seed

# 启动开发服务器
npm run dev
```

## 部署

支持 Docker Compose 部署：

```bash
docker compose up -d
```

## 环境变量

参见 `.env.example`，关键变量：

- `DATABASE_URL` — PostgreSQL 连接字符串
- `AUTH_SECRET` — NextAuth 密钥
- `OWNER_PASSWORD_HASH` — 管理员密码的 bcrypt 哈希（用 `node -e "console.log(require('bcryptjs').hashSync('你的密码', 10))"` 生成，注意转义 `$` 为 `\$`）
