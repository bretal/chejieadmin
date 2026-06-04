import { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Brand } from '../../api/brand';
import * as api from '../../api/brand';
import { isGuest } from '../../auth/token';

const STATUS_OPTIONS = [
  { label: '启用', value: '1' },
  { label: '停用', value: '0' },
] as const;

const STATUS_COLOR: Record<string, string> = {
  '1': '#10b981',
  '0': '#ef4444',
};

const renderStatusOption = (value: string) => {
  const label = STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
  return <span style={{ color: STATUS_COLOR[value], fontWeight: 500 }}>{label}</span>;
};

export default function BrandPage() {
  const [data, setData] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [searchName, setSearchName] = useState('');
  const [form] = Form.useForm();

  const fetch = useCallback(async (p = page, name = searchName) => {
    setLoading(true);
    try {
      const res: any = await api.getBrandList({ pageNum: p, pageSize: 10, name: name || undefined });
      setData(res?.rows || []);
      setTotal(res?.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, searchName]);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: '1', sortOrder: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: Brand) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) {
      await api.updateBrand({ ...values, id: editing.id });
    } else {
      await api.addBrand(values);
    }
    setModalOpen(false);
    message.success(editing ? '更新成功' : '添加成功');
    fetch();
  };

  const handleDelete = async (ids: number[]) => {
    await api.deleteBrand(ids);
    message.success('删除成功');
    fetch();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '品牌名称', dataIndex: 'name', width: 140 },
    { title: 'Logo URL', dataIndex: 'logo', ellipsis: true, width: 200 },
    { title: '国家', dataIndex: 'country', width: 80 },
    { title: '首字母', dataIndex: 'firstLetter', width: 70 },
    { title: '排序', dataIndex: 'sortOrder', width: 60 },
    {
      title: '状态', dataIndex: 'status', width: 70,
      render: (v: string) => renderStatusOption(v),
    },
    {
      title: '操作', key: 'action', width: 160,
      render: (_: unknown, record: Brand) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} disabled={isGuest()} title={isGuest() ? '访客模式下无操作权限' : undefined}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete([record.id!])}>
            <Button type="link" icon={<DeleteOutlined />} disabled={isGuest()} title={isGuest() ? '访客模式下无操作权限' : undefined} style={{ color: '#ef4444' }}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>品牌管理</Typography.Title>
        <Space>
          <Input.Search placeholder="搜索品牌名" allowClear style={{ width: 200 }}
            onSearch={(v) => { setSearchName(v); setPage(1); fetch(1, v); }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={isGuest() ? undefined : openAdd} disabled={isGuest()} title={isGuest() ? '访客模式下无操作权限' : undefined}>新增品牌</Button>
        </Space>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: (p) => { setPage(p); fetch(p); } }}
        locale={{ emptyText: '暂无数据' }} />
      <Modal title={editing ? '编辑品牌' : '新增品牌'} open={modalOpen} onOk={handleOk} onCancel={() => setModalOpen(false)} width={640}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="品牌名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              options={[...STATUS_OPTIONS]}
              labelRender={({ value }) => renderStatusOption(String(value))}
              optionRender={(option) => renderStatusOption(String(option.value))}
            />
          </Form.Item>
          <Form.Item name="logo" label="Logo URL"><Input /></Form.Item>
          <Form.Item name="country" label="国家"><Input /></Form.Item>
          <Form.Item name="firstLetter" label="首字母"><Input maxLength={1} /></Form.Item>
          <Form.Item name="description" label="简介"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="sortOrder" label="排序"><InputNumber min={0} /></Form.Item>
         
        </Form>
      </Modal>
    </div>
  );
}
