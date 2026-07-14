import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // SPA fallback: 所有路由指向 index.html
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // SSE 流式通信需要关闭代理缓冲
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // SSE 请求需要保持长连接
            if (proxyReq.path.includes('/stream')) {
              proxyReq.setHeader('Connection', 'keep-alive');
            }
          });
        },
      },
    },
  },
})
