# 架构文档 — 车界管理后台

## 系统概述

车界管理后台是一个 React 19 + TypeScript 6 + Vite 8 的 SPA（单页应用），使用 Ant Design 6 作为 UI 框架，antd-style 作为 CSS-in-JS 方案。

后端依赖两个服务：
- **Java 后端**（Spring Boot）— 提供业务 CRUD API（`/admin`、`/auth`）
- **Python RAG 后端**（FastAPI）— 提供文档问答 API（`/rag-api`）

## 运行时层次

```
+-----------------------------------------------------------+
|                    Browser (React 19)                      |
|  main.tsx → BrowserRouter → App.tsx                       |
|    ├─ 公开路由: /, /login, /rag-public                    |
|    └─ 受保护路由: /manage/* (AuthGuard → GlassLayout)      |
+-----------------------------------------------------------+
         |  HTTP (Axios)                    |  SSE (fetch)
+-----------------------------------------------------------+
|  Java Backend (:3001)         |  Python RAG Backend (:8000)|
|  /admin, /auth, /monitor      |  /rag-api                   |
+-------------------------------+----------------------------+
```

## 组件层次

```
App.tsx
├─ ErrorBoundary (src/monitor/)
│  └─ ConfigProvider (glassTheme token + zhCN locale)
│     └─ AntdApp (message/modal/notification 上下文)
│        └─ Routes
│           ├─ "/" → ShowcasePage
│           ├─ "/login" → LoginPage
│           ├─ "/rag-public" → RAGPublicPage
│           └─ AuthGuard (检查 isAuthenticated)
│              └─ GlassLayout
│                 ├─ Sider (Logo + Menu, 可折叠, 200px)
│                 ├─ Header (折叠按钮 + 标题 + 访客 Tag + 退出)
│                 └─ Content (Outlet)
│                    ├─ /manage (index) → Dashboard
│                    ├─ /manage/brand → BrandPage
│                    ├─ /manage/car → CarPage
│                    ├─ /manage/car-config → CarConfigPage
│                    ├─ /manage/car-media → CarMediaPage
│                    ├─ /manage/car-color → CarColorPage
│                    ├─ /manage/car-rival → CarRivalPage
│                    ├─ /manage/persona → PersonaPage
│                    ├─ /manage/persona-car → PersonaCarPage
│                    ├─ /manage/banner → BannerPage
│                    ├─ /manage/rag → RAGPage
│                    └─ /manage/apps/next/* → MicroHost
```

## 数据流

### 认证流程

```
1. 用户提交登录表单 → api/auth.ts → POST /auth/login
2. 后端返回 { token, clientId }
3. extractToken() / extractClientId() 存入 localStorage
4. api/request.ts 拦截器每次请求自动附加 Authorization header + clientid header
5. 后端返回 401 → 拦截器 clearToken() → 重定向 /login
```

### CRUD 数据流

```
1. 页面组件 mount → useCallback fetch() → api.xxx.getList(params)
2. api/request.ts 拦截器附加 token → axios GET/POST → Java 后端
3. 响应 → response 拦截器解包 res.data → 页面 setData / setTotal
4. Table 渲染 dataSource，Pagination 触发 onChange → fetch(newPage)
5. Modal Form → validateFields → api.xxx.add/update → message.success → fetch()
```

### RAG 对话流

```
1. 用户输入问题 → api/rag.ts chatRAGStream(question)
2. fetch POST /rag-api/chat/stream (SSE)
3. ReadableStream 逐块读取 → yield 每块文本
4. 页面逐字渲染（打字机效果）
```

## 模块边界

### 导入规则

```
src/pages/         → 可导入: src/api/, src/auth/, src/constants/, src/monitor/, src/components/
src/components/    → 可导入: src/auth/, src/constants/
                   → 禁止: src/pages/, src/api/
src/api/           → 可导入: src/auth/
                   → 禁止: React, src/pages/, src/components/
src/auth/          → 无依赖 (纯工具函数)
src/monitor/       → 无外部依赖 (自包含 SDK)
```

### 主题实现三层模型

| 层 | 文件 | 负责 |
|-----|------|------|
| Token 层 | `glassTheme.ts` | ConfigProvider token（颜色、圆角、字体）+ 组件 classNames |
| CSS 变量层 | `index.css` | 全局 CSS 变量、body 背景、AntD 内部选择器覆盖 |
| 弹出层覆盖 | `glass-overrides.css` | AntD 弹出层组件（Modal/Dropdown/Popover）的 Portal 渲染覆盖 |

## 状态管理

不使用外部状态库。状态分布在：
- **组件本地状态**：各 CRUD 页面的 `useState`（数据、分页、加载、弹窗）
- **localStorage**：认证 token、clientId、访客标记、用户 ID
- **路由状态**：`useLocation`、`useNavigate`、`useSearchParams`
- **AntD 上下文**：`App.useApp()` 的 message/modal/notification

## 构建与部署

### 开发环境

```bash
npm run dev     # Vite 开发服务器 :3000，代理 API 到 :3001 和 :8000
```

### 生产构建

```bash
npm run build   # tsc -b → vite build
                # 产物在 dist/，base 路径为 CDN (VITE_BASE_URL)
                # sourcemap 以 hidden 模式生成，上传后删除
```

### Docker 部署

```
Dockerfile (多阶段):
  Stage 1: node:20-alpine → npm ci → npm run build
  Stage 2: nginx:alpine → 复制 dist/ + nginx.conf

docker-compose.yml:
  ports: 80:80, 443:443
  volumes: /etc/letsencrypt (SSL 证书)
  extra_hosts: host.docker.internal (访问宿主机后端)
```

## 监控 SDK 架构

```
src/monitor/
  core/
    MonitorSDK.ts        ← 单例，统一管理所有模块
    publicAPI.ts         ← initMonitor(), track(), getMonitorSDK()
  error/
    ErrorBoundary.tsx    ← React 错误边界，自动上报
    GlobalErrorCapture.ts ← window.onerror + unhandledrejection
    BreadcrumbManager.ts ← 环形缓冲，记录用户操作路径
  performance/
    PerformanceObserverModule.ts ← Web Vitals (FCP/LCP/CLS/INP)
    NavigationTimingModule.ts    ← DNS/TCP/TLS/TTFB/白屏时间
  reporter/
    Reporter.ts          ← 批量上报(10条/批, 5s刷新) + 指数退避重试(最多5次) + sendBeacon
    OfflineQueue.ts      ← localStorage 离线队列(最多200条)
  tracking/
    AutoTracker.ts       ← data-track 属性自动埋点 + 路由变更追踪
    CustomTracker.ts     ← trackEvent() / trackConversion()
```
