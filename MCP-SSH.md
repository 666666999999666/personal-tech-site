# MCP SSH 配置指南

## 一、什么是 MCP SSH？

MCP（Model Context Protocol）是 AI 与外部工具通信的标准协议。

**MCP SSH** = AI Agent 通过 SSH 协议直接操作你的服务器

```
你（对话）
    ↓
AI Agent
    ↓
MCP SSH 工具
    ↓
SSH 连接到服务器
    ↓
执行命令、修改文件、查看日志
```

## 二、配置步骤

### Step 1：生成 SSH 密钥对

在你的本地电脑（或服务器）上执行：

```bash
# 生成 SSH 密钥对
ssh-keygen -t ed25519 -C "mcp-agent" -f ~/.ssh/mcp_agent_key

# 查看公钥
cat ~/.ssh/mcp_agent_key.pub
```

### Step 2：将公钥添加到服务器

```bash
# 在服务器上执行
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 3：配置 MCP 工具

在 AI 工具（如 Cursor、Claude Desktop）中配置 MCP：

```json
{
  "mcpServers": {
    "ssh": {
      "command": "ssh",
      "args": [
        "-i", "~/.ssh/mcp_agent_key",
        "-o", "StrictHostKeyChecking=no",
        "root@你的服务器IP"
      ]
    }
  }
}
```

## 三、安全建议

| 风险 | 防护措施 |
|------|---------|
| 密钥泄露 | 使用独立密钥，不要和主密钥混用 |
| 权限过大 | 创建受限用户，只给必要权限 |
| 操作不可追溯 | 开启 SSH 审计日志 |
| 误操作 | AI 执行前要求确认 |

## 四、受限用户配置

```bash
# 创建受限用户
useradd -m -s /bin/bash mcp-agent

# 限制 sudo 权限
echo "mcp-agent ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose, /usr/bin/git" >> /etc/sudoers.d/mcp-agent
```

## 五、常用 MCP SSH 命令

```bash
# 查看服务器状态
free -h && df -h && docker ps

# 查看日志
docker logs personal-tech-site_backend_1
docker logs personal-tech-site_frontend_1

# 重启服务
docker-compose restart

# 更新代码
cd ~/personal-tech-site && git pull && docker-compose up -d --build
```
