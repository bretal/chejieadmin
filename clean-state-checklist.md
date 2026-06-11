# Clean State Checklist — 车界管理后台

每次会话结束前逐项检查。提交前也运行此清单。

## 构建验证

- [ ] `npm install` 无错误完成
- [ ] `npx tsc -b` TypeScript 零错误通过
- [ ] `npm run build` 生产构建成功
- [ ] `npm run lint` ESLint 无警告

## 架构边界

- [ ] `src/api/` 无 React 导入
- [ ] `src/components/` 无页面组件导入
- [ ] `src/pages/` 不直接使用 axios（通过 `src/api/`）
- [ ] `src/auth/` 不依赖 React
- [ ] `src/monitor/` 无外部依赖（自包含）

## 运行时验证

- [ ] `npm run dev` 启动无错误
- [ ] 首页 (`/`) Showcase 页面正常展示
- [ ] 登录页 (`/login`) 表单和访客入口可用
- [ ] 管理后台各 CRUD 页面正常加载
- [ ] 新增/编辑 Modal 表单正常弹出
- [ ] 删除 Popconfirm 正常确认
- [ ] RAG 页面 (`/manage/rag`) 文档上传和对话功能正常
- [ ] RAG 公开页面 (`/rag-public`) 无需登录可访问
- [ ] 访客模式：写操作按钮 disabled + tooltip 提示
- [ ] 玻璃主题视觉效果一致（无纯色 AntD 默认样式泄漏）

## 功能清单

- [ ] `feature_list.json` 反映实际功能状态
- [ ] 每个功能有 evidence 描述
- [ ] 无功能处于不一致状态（pass/fail/not-started 与实际情况匹配）

## 代码质量

- [ ] 无 `any` 类型（除 API 响应类型不确定的情况）
- [ ] 命名导出优先
- [ ] 新增文件遵循现有目录约定
- [ ] CRUD 页面遵循标准模式（参考 `docs/STYLE_GUIDE.md`）

## 文档

- [ ] `docs/ARCHITECTURE.md` 反映当前架构
- [ ] `docs/PRODUCT.md` 反映当前功能
- [ ] `session-handoff.md` 已更新（如果会话结束）
- [ ] `claude-progress.md` 已记录本次会话

## 仓库

- [ ] `git status` 无意外文件
- [ ] 无敏感数据（`.env`、credentials）暂存
- [ ] `dist/` 目录未提交
- [ ] 无临时调试文件遗留
