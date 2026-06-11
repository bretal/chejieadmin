# 代码风格指南 — 车界管理后台

## 文件命名

- **页面目录**：PascalCase（`Brand/`、`CarConfig/`、`RAGPublic/`）
- **页面组件文件**：`index.tsx`（每个页面目录下）
- **API 模块**：camelCase（`brand.ts`、`carConfig.ts`、`personaCar.ts`）
- **工具/认证模块**：camelCase（`token.ts`、`request.ts`）
- **CSS 文件**：camelCase 或 kebab-case（`showcase.css`、`glass-overrides.css`）
- **组件目录**：PascalCase（`AuthGuard/`、`GlassLayout/`）

## 导出约定

- 页面组件使用 **default export**
- API 模块使用 **命名导出**（`export function` / `export const`）
- 工具函数使用 **命名导出**
- 类型/接口在 API 模块中 **命名导出**

## CRUD 页面标准模式

每个 CRUD 页面遵循统一模式，按以下顺序组织代码：

```typescript
// 1. 导入
import { useEffect, useState, useCallback } from 'react';
import { Button, Form, Input, message, Modal, Popconfirm, Space, Table, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Entity } from '../../api/xxx';
import * as api from '../../api/xxx';
import { isGuest } from '../../auth/token';

// 2. 常量定义（选项列表、颜色映射）
const STATUS_OPTIONS = [...];

// 3. 渲染辅助函数
const renderXxx = (value: string) => { ... };

// 4. 页面组件（default export）
export default function XxxPage() {
  // 5. 状态声明
  const [data, setData] = useState<Entity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Entity | null>(null);
  const [searchXxx, setSearchXxx] = useState('');
  const [form] = Form.useForm();

  // 6. fetch 函数（useCallback）
  const fetch = useCallback(async (p = page, name = searchXxx) => {
    setLoading(true);
    try {
      const res = await api.getList({ pageNum: p, pageSize: 10, name: name || undefined });
      setData(res?.rows || []);
      setTotal(res?.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, searchXxx]);

  // 7. 数据获取 Effect
  useEffect(() => { fetch(); }, [fetch]);

  // 8. CRUD 操作函数
  const openAdd = () => { ... };
  const openEdit = (record: Entity) => { ... };
  const handleOk = async () => { ... };
  const handleDelete = async (ids: number[]) => { ... };

  // 9. 列定义
  const columns = [ ... ];

  // 10. JSX 渲染
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3}>页面标题</Typography.Title>
        <Space>
          <Input.Search placeholder="搜索..." onSearch={...} />
          <Button type="primary" icon={<PlusOutlined />} onClick={...}
            disabled={isGuest()} title={isGuest() ? '访客模式下无操作权限' : undefined}>
            新增
          </Button>
        </Space>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: ... }}
        locale={{ emptyText: '暂无数据' }} />
      <Modal title={editing ? '编辑' : '新增'} open={modalOpen} onOk={handleOk} onCancel={...}>
        <Form form={form} layout="vertical">
          {/* Form.Items with rules */}
        </Form>
      </Modal>
    </div>
  );
}
```

## TypeScript 约定

- 不写 `any`，除非有明确理由（API 响应类型不确定时可用 `any` 标注）
- API 模块中定义接口类型（`export interface Brand { ... }`）
- 使用 `as const` 定义字面量选项数组
- `useCallback` 的依赖数组完整列出（信任 ESLint react-hooks 规则）

## 样式约定

- 优先使用 AntD 内置 props 和 ConfigProvider token
- 需要覆盖的样式放在 `glassTheme.ts` 的 `classNames` 中
- AntD 内部选择器覆盖放在 `index.css` 中
- 页面特定样式放在页面目录下的 `.css` 文件中（如 `showcase.css`）
- 内联样式仅用于动态值或一次性调整
- 使用 `antd-style` 的 `createStyles` 创建可复用样式（参考 `glassTheme.ts`）

## API 约定

- 所有请求通过 `api/request.ts` 的 axios 实例发起
- RAG 请求使用独立实例（`api/rag.ts`）
- 错误消息使用 `getErrorMessage(error, fallback)` 提取
- 成功操作后调用 `message.success()`，失败在 catch 中 `message.error()`

## 访客权限约定

- 所有写操作按钮检查 `isGuest()`：`disabled={isGuest()}`
- 添加 tooltip 提示：`title={isGuest() ? '访客模式下无操作权限' : undefined}`
- 访客登录入口在 LoginPage 中提供

## 验证命令

```bash
npx tsc -b          # 类型检查（零错误）
npm run lint        # ESLint（零警告）
npm run build       # 生产构建（零错误）
```
