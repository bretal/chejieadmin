# Reliability — 可观测性、清洁状态与基准测试

## 前端监控 SDK

### 概述

车界管理后台内置自包含的前端监控 SDK（`src/monitor/`），零外部依赖，覆盖性能、错误、用户行为三大领域。

### 监控架构

```
main.tsx
  └─ initMonitor({ environment })
       └─ MonitorSDK (单例)
            ├─ PerformanceObserverModule   (FCP/LCP/CLS/INP)
            ├─ NavigationTimingModule      (DNS/TCP/TLS/TTFB/白屏)
            ├─ GlobalErrorCapture          (window.onerror + unhandledrejection)
            ├─ ErrorBoundary               (React 组件级错误捕获)
            ├─ AutoTracker                 (data-track 自动埋点 + 路由追踪)
            ├─ CustomTracker               (trackEvent/trackConversion API)
            ├─ BreadcrumbManager           (环形缓冲 20 条用户操作)
            └─ Reporter
                 ├─ 批量上报 (10条/批, 5s刷新)
                 ├─ 指数退避重试 (最多5次)
                 ├─ OfflineQueue (localStorage, 最多200条)
                 └─ sendBeacon (页面卸载时)
```

### 上报数据结构

```typescript
interface MonitorPayload {
  type: 'performance' | 'error' | 'track'
  timestamp: number
  data: PerformancePayload | ErrorPayload | TrackPayload
  breadcrumbs?: Breadcrumb[]
}
```

### Sourcemap 管理

生产构建时通过自定义 Vite 插件：
1. 生成 hidden sourcemap（不暴露给用户）
2. POST 上传到监控服务（`VITE_MONITOR_SOURCEMAP_URL`）
3. 删除本地 .map 文件

这确保生产环境错误堆栈可反向解析，同时不泄露源码。

## 清洁状态管理

### 目的

确保每次开发会话在可控状态下开始和结束，防止累积问题影响后续开发。

### 清洁状态检查（参考 `clean-state-checklist.md`）

每次会话结束前检查：
1. **构建验证** — `tsc -b` + `npm run build` + `npm run lint` 通过
2. **架构边界** — `bash scripts/check-architecture.sh` 零违规
3. **运行时验证** — 开发服务器正常启动，关键页面可访问
4. **功能清单** — `feature_list.json` 状态与实际一致
5. **代码质量** — 无滥用 any，命名约定一致
6. **文档** — 相关 docs/ 文件已同步更新
7. **仓库** — 无意外文件，`dist/` 未提交

### 会话交接（参考 `session-handoff.md`）

- **恢复时**: 读取 `session-handoff.md` 获取上一会话的完成项、剩余项、决策、阻塞项
- **结束时**: 更新 `session-handoff.md` 记录本次会话的产出和状态变化

## 构建与验证流水线

### 开发环境

```bash
npm run dev             # Vite 开发服务器 + HMR, 端口 3000
```

### 验证命令链

```bash
npx tsc -b                          # 1. 类型检查（严格模式）
npm run lint                        # 2. ESLint（零警告目标）
bash scripts/check-architecture.sh  # 3. 架构边界检查
npm run build                       # 4. 生产构建
bash scripts/benchmark.sh           # 5. 性能基准（可选）
bash scripts/cleanup-scanner.sh     # 6. 清理扫描（可选）
```

### 基准测试

| 指标 | 测量内容 | 参考值 |
|------|---------|--------|
| TypeScript 类型检查 | `tsc -b` 耗时 | < 30s |
| Vite 生产构建 | `npm run build` 耗时 + 产物大小 | < 60s, < 500KB gzip |
| ESLint | `npm run lint` 耗时 | < 10s |
| 架构边界检查 | `check-architecture.sh` 耗时 | < 1s |

### 清理扫描

`bash scripts/cleanup-scanner.sh` 检查：
- 遗留 TODO/FIXME 注释
- 临时/调试文件（.log, .tmp, .bak）
- 可能未使用的 npm 依赖
- dist/ 目录状态
- 空目录

## 质量追踪

### 质量文档

`quality-document.md` 持续追踪每个模块的质量等级（A/B/C/D），检测质量漂移。

### 评估评分表

`evaluator-rubric.md` 定义 8 个维度的 1-5 分评分标准：
- 构建与编译
- 功能完整性
- 架构合规
- 代码质量
- UI 一致性
- 访客权限
- 错误处理
- 文档更新

## Harness 自检

### 定期审查

建议每月运行一次完整审查：
1. 运行完整验证命令链
2. 检查 `feature_list.json` 与实际一致
3. 审查 `evaluator-rubric.md` 重新评分
4. 更新 `quality-document.md`
5. 运行 `init.sh` 确认新会话可干净启动
6. 检查是否有可以简化的 harness 组件（随着模型能力提升）
