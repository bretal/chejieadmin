import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { sourceMapUploadPlugin } from './vite-plugin-sourcemap-upload'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
  plugins: [
    react(),
    mode === 'production' && sourceMapUploadPlugin({
      uploadUrl: env.VITE_MONITOR_SOURCEMAP_URL || '/admin/monitor/sourcemap',
      appName: 'chejieadmin',
      appVersion: process.env.npm_package_version || '0.0.0',
      enabled: true,
      deleteAfterUpload: true,
    }),
  ].filter(Boolean),
  base: env.VITE_BASE_URL || '/',
  build: {
    sourcemap: 'hidden',
  },
  server: {
    port: 3000,
    proxy: {
      '/admin': {
        target: 'http://localhost:3001',
        changeOrigin: true,
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
      '/upload': {
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
      '/monitor': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  }
})
