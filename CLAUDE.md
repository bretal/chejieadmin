# CLAUDE.md -- 车界管理后台 快速参考

## 构建与运行

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器 (port 3000)
npm run build      # tsc -b && vite build
npm run lint       # ESLint 检查
npm run preview    # 预览生产构建
```

## 快速开始

```bash
bash init.sh       # 完整验证：安装 → 类型检查 → 构建
```

## 关键文件

| 文件 | 用途 |
|------|------|
| `src/main.tsx` | 入口：BrowserRouter、dayjs 中文 locale、initMonitor |
| `src/App.tsx` | 根组件：ErrorBoundary → ConfigProvider(玻璃主题) → Routes |
| `src/glassTheme.ts` | 玻璃拟态主题（antd-style createStyles + ConfigProvider classNames） |
| `src/index.css` | 全局样式、CSS 变量、AntD 内部组件覆盖 |
| `src/api/request.ts` | Axios 实例：baseURL=/admin、token 拦截器、401 处理 |
| `src/api/rag.ts` | RAG API：文档上传、SSE 流式对话、独立 axios 实例 |
| `src/auth/token.ts` | Token 管理：localStorage 存取、访客判断 |
| `src/components/AuthGuard/index.tsx` | 路由守卫：未认证 → /login |
| `src/components/GlassLayout/index.tsx` | 管理后台外壳：Sider(200px) + Header(64px) + Content |
| `src/monitor/index.ts` | 监控 SDK 入口 |
| `src/pages/Showcase/index.tsx` | 公开作品展示页（首页 `/`） |
| `src/pages/Login/index.tsx` | 登录页 + 访客入口 + RAG 公开入口 |
| `src/pages/RAG/index.tsx` | RAG 问答助手（需认证） |
| `src/pages/RAGPublic/index.tsx` | RAG 问答助手（公开） |
| `vite.config.ts` | Vite 配置：React 插件、多路径代理、sourcemap 上传 |
| `feature_list.json` | 功能清单与状态追踪 |

## 路由结构

```
/                        → ShowcasePage（公开作品页）
/login                   → LoginPage
/rag-public              → RAGPublicPage（公开 RAG）
/manage                  → [AuthGuard] → [GlassLayout] → Dashboard
/manage/brand            → BrandPage
/manage/car              → CarPage
/manage/car-config       → CarConfigPage
/manage/car-media        → CarMediaPage
/manage/car-color        → CarColorPage
/manage/car-rival        → CarRivalPage
/manage/persona          → PersonaPage
/manage/persona-car      → PersonaCarPage
/manage/banner           → BannerPage
/manage/rag              → RAGPage
/manage/apps/next/*      → MicroHost（qiankun 预留）
```

## 后端代理（Vite 开发模式）

| 前端路径 | 代理目标 | 用途 |
|----------|---------|------|
| `/admin` | `localhost:3001` | 业务 CRUD API |
| `/auth` | `localhost:3001` | 登录认证 |
| `/rag-api` | `localhost:8000` | RAG 文档问答 |
| `/monitor` | `localhost:3001` | 监控上报 |

## 架构规则

- **页面不直接调 axios** — 通过 `src/api/` 模块
- **API 层不导入 React** — 纯数据获取
- **组件不导入页面** — 单向依赖
- **认证状态来自 `src/auth/token.ts`** — 不在组件中直接操作 localStorage key
- **访客只读** — 所有写操作按钮通过 `isGuest()` 检查后 disabled
- **玻璃主题三层实现** — ConfigProvider token + CSS 变量 + glass-overrides.css

## 添加 CRUD 功能的步骤

1. 在 `src/api/` 新建模块文件（类型 + CRUD 函数）
2. 在 `src/pages/` 新建页面目录和 `index.tsx`
3. 页面遵循 CRUD 模式：fetch → Table → Modal + Form
4. 在 `src/App.tsx` 添加路由
5. 在 `src/components/GlassLayout/index.tsx` 添加菜单项
6. 更新 `feature_list.json`
7. `npm run build` 验证

## CRUD 页面标准模式

```typescript
// 1. useState: data, total, loading, page, modalOpen, editing, searchXxx
// 2. useCallback fetch(p, ...) → setLoading → api.getList → setData/setTotal
// 3. useEffect fetch on mount and deps change
// 4. openAdd / openEdit → set form values → setModalOpen
// 5. handleOk → validateFields → api.add|update → message.success → fetch
// 6. handleDelete → api.delete → message.success → fetch
// 7. columns → Table (rowKey, pagination, loading, locale)
// 8. Modal + Form (layout="vertical", rules)
```

## 验证命令

```bash
npx tsc -b              # TypeScript 类型检查
npm run build           # 完整构建（tsc + vite）
npm run lint            # ESLint
```
