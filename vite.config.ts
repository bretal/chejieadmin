import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
  plugins: [react()],
  base: env.VITE_BASE_URL || '/',
  server: {
    port: 3000,
    proxy: {
      '/admin': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        bypass(req) {
          // 浏览器页面请求（Accept: text/html）走 SPA，不代理到后端
          const accept = req.headers.accept || '';
          if (accept.includes('text/html')) {
            return '/index.html';
          }
        },
      },
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/menu': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/resource': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/captcha': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/dev-api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-api/, ''),
      },
      '/rag-api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rag-api/, ''),
      },
    },
  },
  }
})
