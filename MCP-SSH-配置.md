# MCP SSH 配置

## 服务器信息

| 项目 | 值 |
|------|-----|
| 服务器 IP | `193.112.192.229` |
| 登录用户 | `root` |
| 操作系统 | Ubuntu |
| 私钥路径 | `C:\Users\90354\.ssh\mcp_agent_key\id_ed25519` |

## MCP 配置

配置文件已创建：`C:\Users\90354\.trae-cn\mcps\s_个人网站-4874669d\solo_agent\mcp_ssh.json`

```json
{
  "mcpServers": {
    "ssh-server": {
      "command": "ssh",
      "args": [
        "-i", "C:\\Users\\90354\\.ssh\\mcp_agent_key\\id_ed25519",
        "-o", "StrictHostKeyChecking=no",
        "-o", "UserKnownHostsFile=NUL",
        "root@193.112.192.229"
      ]
    }
  }
}
```

## 使用方式

在 Trae 中，你可以直接说：

> "SSH 到服务器，执行 `docker ps`"
> "SSH 到服务器，查看 Nginx 日志"
> "SSH 到服务器，更新代码并重启服务"

AI 会自动通过 SSH 连接到 `193.112.192.229` 执行命令。

## 常用命令

```bash
# 查看服务状态
docker ps
docker-compose ps

# 查看日志
docker logs personal-tech-site_frontend_1
docker logs personal-tech-site_backend_1

# 更新部署
cd ~/personal-tech-site && git pull && docker-compose up -d --build

# 查看系统状态
free -h && df -h
```

## 安全建议

1. **私钥保管好**：`id_ed25519` 文件不要泄露
2. **限制 root 登录**：建议创建普通用户，给 sudo 权限
3. **防火墙配置**：只开放 22、80、443 端口
