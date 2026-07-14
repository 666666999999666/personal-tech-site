# 域名解析 + HTTPS 配置指南

## 一、域名解析

### 1. 登录你的域名服务商（如腾讯云 DNSPod）

### 2. 添加 A 记录

| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| @       | A       | 你的服务器公网IP | 600 |
| www     | A       | 你的服务器公网IP | 600 |

> 例如：你的域名是 `tech-space.com`，服务器 IP 是 `123.45.67.89`

### 3. 等待 DNS 生效（通常 5-30 分钟）

```bash
# 验证 DNS 是否生效
dig tech-space.com A
```

---

## 二、HTTPS 配置（Let's Encrypt + Certbot）

### 1. 在服务器上安装 Certbot

```bash
# Ubuntu/Debian
apt-get install -y certbot python3-certbot-nginx

# 或者使用 Docker
docker run -it --rm -p 80:80 \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  certbot/certbot certonly --standalone -d tech-space.com -d www.tech-space.com
```

### 2. 获取 SSL 证书

```bash
certbot certonly --standalone -d tech-space.com -d www.tech-space.com
```

### 3. 更新 nginx.conf 支持 HTTPS

```nginx
server {
    listen 80;
    server_name tech-space.com www.tech-space.com;
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tech-space.com www.tech-space.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/tech-space.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tech-space.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # 反向代理到后端
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
```

### 4. 自动续期

```bash
# 测试自动续期
certbot renew --dry-run

# 添加到 crontab（每天凌晨 2 点检查）
echo "0 2 * * * certbot renew --quiet" | crontab -
```

---

## 三、防火墙配置

```bash
# 开放 80 和 443 端口
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

---

## 四、验证部署

```bash
# 测试 HTTP 是否重定向到 HTTPS
curl -I http://tech-space.com

# 测试 HTTPS
curl -I https://tech-space.com

# 测试 API
curl https://tech-space.com/api/health
```
