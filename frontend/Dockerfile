# 前端 Dockerfile
# 第一阶段：构建
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装依赖（使用国内镜像）
RUN npm ci --registry=https://registry.npmmirror.com

# 复制源代码
COPY . .

# 构建生产包
RUN npm run build

# 第二阶段：运行
FROM nginx:alpine

# 复制构建好的静态文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80
