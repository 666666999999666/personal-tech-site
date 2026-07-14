#!/bin/bash
# deploy-server-init.sh
# 服务器环境初始化脚本
# 在腾讯云 CVM 上执行

echo "=== 服务器环境初始化 ==="

# 1. 更新系统
echo "1. 更新系统..."
apt-get update && apt-get upgrade -y

# 2. 安装 Docker
echo "2. 安装 Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "Docker 安装完成"
else
    echo "Docker 已安装"
fi

# 3. 安装 Docker Compose
echo "3. 安装 Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose 安装完成"
else
    echo "Docker Compose 已安装"
fi

# 4. 安装 Git
echo "4. 安装 Git..."
apt-get install -y git

# 5. 创建项目目录
echo "5. 创建项目目录..."
mkdir -p ~/personal-tech-site
cd ~/personal-tech-site

# 6. 克隆代码（首次部署时手动执行）
# git clone https://github.com/666666999999666/personal-tech-site.git .

echo "=== 初始化完成 ==="
echo ""
echo "接下来需要："
echo "1. 手动克隆代码: git clone https://github.com/666666999999666/personal-tech-site.git ."
echo "2. 配置 GitHub Actions secrets: SSH_PRIVATE_KEY, SERVER_IP, SERVER_USER"
echo "3. 配置域名解析"
echo "4. 配置 HTTPS (Let's Encrypt)"
