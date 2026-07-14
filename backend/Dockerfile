# 后端 Dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装依赖
RUN npm ci --production

# 复制源代码
COPY src/ ./src/

# 暴露 3001 端口
EXPOSE 3001

# 启动命令
CMD ["node", "src/server.js"]
