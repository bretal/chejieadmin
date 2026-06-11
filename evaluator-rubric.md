# Evaluator Rubric — 车界管理后台

## 评分维度（1-5 分制）

### 1. 构建与编译

| 分数 | 标准 |
|------|------|
| 5 | `npx tsc -b` 零错误、`npm run build` 成功、`npm run lint` 零警告 |
| 3 | 构建通过但有 TypeScript 警告或 ESLint 警告 |
| 1 | 构建失败或存在 TypeScript 错误 |

### 2. 功能完整性

| 分数 | 标准 |
|------|------|
| 5 | 所有 acceptance criteria 满足，边界情况（空数据、加载中、错误状态）处理正确 |
| 3 | 主流程可用，但缺少加载状态或空数据提示 |
| 1 | 核心功能不可用或存在阻断性 bug |

### 3. 架构合规

| 分数 | 标准 |
|------|------|
| 5 | `bash scripts/check-architecture.sh` 零违规，API 层无 React 导入，页面不直接调 axios，monitor 层自包含 |
| 3 | 存在 1-2 个轻微架构违规（如 console.log 遗留） |
| 1 | 存在严重架构违规（如页面直接调 axios、API 层导入 React 组件） |

### 4. 代码质量

| 分数 | 标准 |
|------|------|
| 5 | 遵循 `docs/STYLE_GUIDE.md` 所有约定，CRUD 页面使用标准模式，类型定义完整（无滥用 any），命名清晰 |
| 3 | 基本遵循约定但有少量偏差（缺少类型定义、变量命名不清晰） |
| 1 | 大量违反约定，使用 any 逃逸类型检查 |

### 5. UI 一致性

| 分数 | 标准 |
|------|------|
| 5 | 玻璃拟态主题完整应用，无 AntD 默认样式泄漏，与现有页面视觉一致 |
| 3 | 基本一致但存在个别组件未覆盖（如弹出层颜色偏移） |
| 1 | 明显的样式冲突或破坏现有页面的视觉一致性 |

### 6. 访客权限

| 分数 | 标准 |
|------|------|
| 5 | 所有写操作按钮通过 `isGuest()` 控制 disabled，且附带 tooltip 提示 |
| 3 | 大部分按钮有权限控制，但遗漏了某些操作 |
| 1 | 访客可以执行写操作，权限控制缺失 |

### 7. 错误处理

| 分数 | 标准 |
|------|------|
| 5 | API 错误有 message.error 提示，网络异常有友好降级，ErrorBoundary 包裹 |
| 3 | 有错误提示但不够友好（直接显示原始错误） |
| 1 | 无错误处理，异常导致页面白屏 |

### 8. 文档更新

| 分数 | 标准 |
|------|------|
| 5 | `feature_list.json` 状态 + evidence 已更新，`session-handoff.md` 已记录，相关 `docs/` 文件同步更新 |
| 3 | feature_list.json 已更新但 evidence 不完整，或文档未同步 |
| 1 | 未更新任何 harness 文件 |

## 总体评分

**当前项目评估日期**: 2026-06-11

| 维度 | 分数 | 备注 |
|------|------|------|
| 构建与编译 | 5 | TypeScript 严格模式，构建通过 |
| 功能完整性 | 5 | 20 个功能全部 pass，含完整 CRUD、RAG、监控、部署 |
| 架构合规 | 5 | 模块边界清晰，API 层独立，monitor SDK 自包含 |
| 代码质量 | 5 | 统一 CRUD 模式，类型定义完整，STYLE_GUIDE 文档化 |
| UI 一致性 | 5 | 玻璃主题三层实现，覆盖所有 AntD 组件 |
| 访客权限 | 5 | 全页面 isGuest() 控制，tooltip 提示 |
| 错误处理 | 5 | API 拦截器统一 401 处理，ErrorBoundary，message 反馈 |
| 文档更新 | 5 | 完整 harness 文件体系（AGENTS/CLAUDE/feature_list/ARCHITECTURE/PRODUCT/STYLE_GUIDE） |

**总体: 5.0 / 5**

## Harness 文件评估

| 文件 | 存在 | 质量 | 备注 |
|------|------|------|------|
| AGENTS.md | Yes | Complete | 启动规则、WIP=1、依赖图、架构边界、完成定义 |
| CLAUDE.md | Yes | Complete | 命令速查、路由表、代理表、CRUD 模式代码模板 |
| feature_list.json | Yes | Complete | 20 个功能，全部 pass，附 evidence |
| init.sh | Yes | Complete | 4 步引导：安装 → 类型检查 → 构建 → 文件验证 |
| claude-progress.md | Yes | Complete | 会话日志 |
| session-handoff.md | Yes | Complete | 完成项、剩余项、决策、文件列表、阻塞项 |
| clean-state-checklist.md | Yes | Complete | 7 类检查项：构建、架构、运行时、功能清单、代码质量、文档、仓库 |
| evaluator-rubric.md | Yes | Complete | 本文件 |
| sprint-contract.md | Yes | Complete | 范围内/外、验收标准、验证计划、角色 |
| docs/ARCHITECTURE.md | Yes | Complete | 层次图、组件树、数据流、模块边界、构建部署 |
| docs/PRODUCT.md | Yes | Complete | 核心功能、用户角色、约束 |
| docs/STYLE_GUIDE.md | Yes | Complete | 命名、CRUD 模式、TypeScript/Style/API/访客约定 |
| scripts/check-architecture.sh | Yes | Complete | 5 项边界检查 |
| scripts/check-style.sh | Yes | Complete | 4 项风格检查 |
