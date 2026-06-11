# AGENTS.md -- 车界管理后台 (chejieadmin)

## 启动规则

在写任何代码之前，按顺序完成以下步骤：

1. **通读本文件** — 了解项目边界和约定
2. **阅读 `CLAUDE.md`** — Claude Code 快速参考（如果你用 Claude Code）
3. **阅读 `docs/ARCHITECTURE.md`** — 理解路由结构、组件层次、数据流
4. **阅读 `docs/PRODUCT.md`** — 理解产品需求与功能范围
5. **运行 `bash init.sh`** — 验证项目可构建
6. **阅读 `feature_list.json`** — 查看当前功能状态

## 项目上下文

车界管理后台是一个 **React 19 + TypeScript 6 + Vite 8 + Ant Design 6** 的汽车数据管理 SPA。

核心能力：
- 品牌、车型、配置、媒体、颜色、竞品关系 CRUD 管理
- 用户画像与车型推荐管理
- Banner 管理
- RAG 问答助手（基于知识库的 AI 对话，支持 SSE 流式响应）
- 访客模式（只读访问）
- 前端监控 SDK（性能、错误、埋点、离线队列）
- 个人作品展示页（Showcase）

后端依赖：
- Java 后端（`localhost:3001`）— 提供 `/admin`、`/auth` 等业务 API
- Python RAG 后端（`localhost:8000`）— 提供 `/rag-api` 的文档上传和对话 API

## 文档层次

```
AGENTS.md                    ← 你现在在这里（入口，路由器）
CLAUDE.md                    ← Claude Code 快速参考
docs/
  ARCHITECTURE.md            ← 路由、组件、数据流
  PRODUCT.md                 ← 功能需求、用户角色
  STYLE_GUIDE.md             ← 代码风格、CRUD 页面模式
  superpowers/               ← AI 辅助开发的 spec/plan 工作流
```

## 目录结构

```
src/
  main.tsx                   ← 入口：BrowserRouter + dayjs + initMonitor
  App.tsx                    ← 根组件：ErrorBoundary > ConfigProvider(玻璃主题) > Routes
  glassTheme.ts              ← 玻璃拟态主题（antd ConfigProvider token + classNames）
  index.css                  ← 全局样式 + CSS 变量 + 滚动条
  glass-overrides.css        ← AntD 弹出层组件玻璃化覆盖
  api/                       ← API 层：axios 实例 + 各领域模块 (brand/car/rag/...)
  auth/                      ← 认证模块：token 管理 (localStorage)、访客登录
  components/
    AuthGuard/               ← 路由守卫：未认证重定向 /login
    GlassLayout/             ← 管理后台外壳：Sider + Header + Content
  constants/                 ← 路由常量
  micro/                     ← qiankun 微前端注册（预留）
  monitor/                   ← 前端监控 SDK：性能、错误、埋点、上报
  pages/                     ← 页面组件：Showcase, Login, Dashboard, 各 CRUD 页, RAG
```

## 架构边界

### 页面层 (`src/pages/`)
- 每个页面是独立组件，自行管理数据获取和状态
- 通过 `src/api/` 模块发起请求，不直接使用 axios
- 可以导入 `src/auth/`、`src/constants/`、`src/monitor/`

### API 层 (`src/api/`)
- `request.ts`：统一的 axios 实例，自动附加 token 和 clientId，处理 401
- 每个领域模块导出类型接口和 CRUD 函数
- **禁止**导入 React 或页面组件

### 组件层 (`src/components/`)
- 可复用组件（AuthGuard、GlassLayout）
- **禁止**导入页面组件

### 认证层 (`src/auth/`)
- 纯 token 工具函数，基于 localStorage
- 不依赖 React（仅被组件调用）

### 监控层 (`src/monitor/`)
- 自包含 SDK，零外部依赖
- 初始化在 `main.tsx` 中，页面通过 `track()` / `trackEvent()` 调用

## 约定

- TypeScript 严格模式（`noUnusedLocals`、`noUnusedParameters`、`erasableSyntaxOnly`）
- 命名导出为主
- CRUD 页面统一模式：`useState` + `useCallback` + `useEffect` fetch → AntD `<Table>` → `<Modal>` + `<Form>`
- 日期处理统一使用 `dayjs`（中文 locale）
- 访客权限通过 `isGuest()` 检查，禁用写操作按钮
- 玻璃主题通过 `glassTheme.ts` + `index.css` + `glass-overrides.css` 三层实现

## WIP=1 策略

**一次只做一个功能。** 任何时候只允许一个功能处于"进行中"状态。

规则：
1. 从 `feature_list.json` 选一个 `not_started` 的功能
2. 将其状态更新为 `active`
3. 实现该功能并端到端验证通过（参考完成定义）
4. 将其状态更新为 `pass`，附验证证据
5. 运行 `clean-state-checklist.md` 确认清洁
6. 提交（一个功能一个 commit）
7. 再开始下一个功能

**不允许**：同时激活多个功能、在核心功能未通过验证时重构代码、跳过验证直接标记 pass。

## 功能依赖图

新功能应按以下依赖顺序实现：

```
页面层（无依赖，可并行）:
  Showcase 页 → Login 页 → Dashboard → CRUD 页面（Brand/Car/CarConfig/...）
  
  每个 CRUD 页面依赖: API 模块 → 路由注册 → 菜单项

组件层（可被多个页面共享）:
  AuthGuard ← 无依赖
  GlassLayout ← AuthGuard（包裹在受保护路由外层）

基础设施层（全局，优先完成）:
  玻璃主题 ← 无依赖
  API 层 ← auth/token
  监控 SDK ← 无依赖
```

## 完成定义

一个功能"完成"意味着：

1. TypeScript 编译通过（`npx tsc -b`）
2. Vite 构建通过（`npm run build`）
3. ESLint 无报错（`npm run lint`）
4. 功能出现在 `feature_list.json` 中且状态为 `"pass"`，附验证证据
5. 代码遵循上述架构边界
6. 相关文档已更新（`docs/` 目录）

## 会话交接

- 恢复工作时，先读 `session-handoff.md` 获取上一会话的上下文
- 结束会话时，更新 `session-handoff.md`：
  - 完成了什么
  - 还剩什么
  - 阻塞项或决策
  - 修改了哪些文件

## 清洁状态

每次会话结束前，对照 `clean-state-checklist.md` 逐项检查：
- 构建通过
- 类型检查通过
- feature_list.json 已更新
- 临时文件已清理
- 标准启动路径可用
