# 车界管理后台 (chejieadmin)

基于 **React 19 + TypeScript 6 + Vite 8 + Ant Design 6** 的汽车数据管理平台，集成 RAG 智能问答、Next.js 子应用、访客模式和完善的权限控制体系。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19、TypeScript 6 |
| 构建 | Vite 8 |
| UI | Ant Design 6 + antd-style（玻璃拟态主题） |
| 路由 | react-router-dom 7 |
| HTTP | Axios |
| 微前端 | qiankun（Next.js 子应用集成） |
| AI | RAG 检索增强生成（SSE 流式对话，支持 PDF/DOCX/MD/CSV/TXT） |
| 部署 | Docker 多阶段构建 + Nginx + SSL |
| 监控 | 自建前端监控 SDK（性能/错误/埋点） |

## 项目特色

### 微前端集成

通过 qiankun 框架集成 Next.js 子应用，在 `/manage/apps/next` 路由下挂载独立部署的 Next.js 应用，实现主子应用隔离、按需加载。

### RAG 智能问答

- **文档上传**：支持 PDF、DOCX、MD、CSV、TXT 多种格式，服务端向量化存储
- **流式对话**：基于 SSE（Server-Sent Events）的实时流式响应，打字机效果渲染
- **双入口设计**：认证版（`/manage/rag`，需登录）和公开版（`/rag-public`，无需登录）

### 访客模式

- 免密一键登录，自动分配临时身份
- 全页面只读访问，所有写操作按钮禁用并附权限提示
- 访客在 RAG 模块限制上传 1 个文档
- Header 显示橙色"访客模式"标签，一键退出

### 权限控制

- **认证守卫**：`AuthGuard` 组件拦截未认证请求，自动重定向登录页
- **Token 管理**：Bearer Token + ClientId 双重标识，请求拦截器自动附加
- **401 自动处理**：Token 过期自动清除本地凭据并跳转登录页
- **API 白名单**：登录/注册/验证码等接口免 Token 校验

### 登录验证

- 账号密码登录
- 验证码校验
- 登录成功自动存储 Token、ClientId、UserId
- 退出登录同时清除后端会话和本地状态

## Harness Engineering 架构

本项目采用 **Harness Engineering** 工程方法论，为 AI Agent 提供结构化的项目协作基础设施。

### 五大子系统

```
指令系统          工具系统          环境系统          状态系统          反馈系统
AGENTS.md        npm scripts      init.sh          feature_list.json  check-architecture.sh
CLAUDE.md        Vite             docker-compose   claude-progress.md check-style.sh
docs/            各类 CLI          nginx.conf       session-handoff.md evaluator-rubric.md
                                                                    benchmark.sh
                                                                    cleanup-scanner.sh
```

### 核心 Harness 文件

| 文件 | 用途 |
|------|------|
| `AGENTS.md` | Agent 入口文件：启动规则、架构边界、WIP=1 策略、完成定义 |
| `CLAUDE.md` | Claude Code 快速参考：命令速查、路由表、CRUD 模式模板 |
| `feature_list.json` | 20 个功能的机器可读状态清单，含验证证据 |
| `init.sh` | 标准化引导：安装 → 类型检查 → 构建 → 文件验证 |
| `clean-state-checklist.md` | 7 类清洁状态检查项，每次会话退出前校验 |
| `session-handoff.md` | 跨会话交接工件，避免上下文丢失 |
| `evaluator-rubric.md` | 8 维度质量评分标准（构建/功能/架构/代码/UI/权限/错误/文档） |
| `quality-document.md` | 模块级质量追踪，A/B/C/D 等级评分 |
| `docs/ARCHITECTURE.md` | 运行时层次、组件树、数据流、模块边界 |
| `docs/PRODUCT.md` | 功能需求、用户角色、产品约束 |
| `docs/STYLE_GUIDE.md` | CRUD 页面标准模式、TypeScript/API/访客约定 |
| `docs/RELIABILITY.md` | 监控 SDK 架构、验证流水线、质量追踪 |
| `scripts/check-architecture.sh` | 5 项架构边界自动检查 |
| `scripts/benchmark.sh` | 构建性能基准测试 |
| `scripts/cleanup-scanner.sh` | 代码质量问题扫描（TODO、临时文件、未使用依赖） |

## 快速开始

```bash
# 初始化
bash init.sh

# 开发
npm run dev            # 启动开发服务器 (port 3000)

# 构建
npm run build          # tsc -b && vite build

# 检查
npm run lint           # ESLint
bash scripts/check-architecture.sh   # 架构边界检查
bash scripts/benchmark.sh            # 性能基准
```

## 目录结构

```
chejieadmin/
├── AGENTS.md                     # Harness: Agent 入口
├── CLAUDE.md                     # Harness: 快速参考
├── feature_list.json             # Harness: 功能状态
├── init.sh                       # Harness: 引导脚本
├── src/
│   ├── main.tsx                  # 应用入口
│   ├── App.tsx                   # 根组件 + 路由配置
│   ├── glassTheme.ts             # 玻璃拟态主题（AntD ConfigProvider）
│   ├── api/                      # API 层（11 个领域模块 + 统一拦截器）
│   ├── auth/                     # 认证模块（Token/访客管理）
│   ├── components/               # 可复用组件（AuthGuard/GlassLayout）
│   ├── monitor/                  # 自建前端监控 SDK
│   ├── pages/                    # 页面组件（10 个 CRUD 页 + RAG + Showcase）
│   └── constants/                # 路由常量
├── docs/                         # Harness: 专题文档
├── scripts/                      # Harness: 自动化脚本
├── Dockerfile                    # 多阶段构建
├── docker-compose.yml            # 容器编排
└── nginx.conf                    # Nginx 反向代理 + SSL + SPA 回退
```
