import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, Typography, message, Select, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { CarColor } from '../../api/carColor';
import * as api from '../../api/carColor';
import { getCarList, type Car } from '../../api/car';

export default function CarColorPage() {
  const [data, setData] = useState<CarColor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CarColor | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [filterCarId, setFilterCarId] = useState<number | undefined>();
  const [form] = Form.useForm();

  const fetch = useCallback(async (p = page, carId = filterCarId) => {
    setLoading(true);
    try {
      const res: any = await api.getColorList({ pageNum: p, pageSize: 10, carId: carId || undefined });
      setData(res?.rows || []);
      setTotal(res?.total || 0);
    } finally { setLoading(false); }
  }, [page, filterCarId]);

  useEffect(() => { fetch(); getCarList({ pageNum: 1, pageSize: 200 }).then((r: any) => setCars(r?.rows || [])); }, [fetch]);

  const openAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ status: '1', sortOrder: 0, isMetallic: '0', price: 0 }); setModalOpen(true); };
  const openEdit = (record: CarColor) => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) await api.updateColor({ ...values, id: editing.id });
    else await api.addColor(values);
    setModalOpen(false); message.success(editing ? '更新成功' : '添加成功'); fetch();
  };

  const handleDelete = async (ids: number[]) => { await api.deleteColor(ids); message.success('删除成功'); fetch(); };

  const getCarName = (id: number) => cars.find((c) => c.id === id)?.name || '-';

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '车型', dataIndex: 'carId', width: 120, render: (v: number) => getCarName(v) },
    { title: '颜色名', dataIndex: 'colorName', width: 100 },
    { title: '色值', dataIndex: 'hexValue', width: 100, render: (v: string) => <Space><div style={{ width: 18, height: 18, borderRadius: 4, background: v, border: '1px solid rgba(255,255,255,0.2)' }} /><code style={{ color: '#a0a0b0' }}>{v}</code></Space> },
    { title: '金属漆', dataIndex: 'isMetallic', width: 70, render: (v: string) => v === '1' ? <Tag color="gold">是</Tag> : <Tag>否</Tag> },
    { title: '选装价(万)', dataIndex: 'price', width: 100 },
    { title: '排序', dataIndex: 'sortOrder', width: 60 },
    { title: '操作', key: 'action', width: 140,
      render: (_: unknown, r: CarColor) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete([r.id!])}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ color: '#e8e8ed', margin: 0 }}>颜色管理</Typography.Title>
        <Space>
          <Select placeholder="筛选车型" allowClear style={{ width: 160 }}
            options={cars.map((c) => ({ label: c.name, value: c.id }))}
            onChange={(v) => { setFilterCarId(v); setPage(1); fetch(1, v); }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增颜色</Button>
        </Space>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: (p) => { setPage(p); fetch(p); } }}
        locale={{ emptyText: '暂无数据' }} />
      <Modal title={editing ? '编辑颜色' : '新增颜色'} open={modalOpen} onOk={handleOk} onCancel={() => setModalOpen(false)} width={420}>
        <Form form={form} layout="vertical">
          <Form.Item name="carId" label="所属车型" rules={[{ required: true }]}>
            <Select options={cars.map((c) => ({ label: c.name, value: c.id }))} placeholder="选择车型" />
          </Form.Item>
          <Form.Item name="colorName" label="颜色名称" rules={[{ required: true }]}><Input placeholder="如：珍珠白" /></Form.Item>
          <Form.Item name="hexValue" label="色值" rules={[{ required: true }]}><Input placeholder="#f5f5f0" /></Form.Item>
          <Form.Item name="isMetallic" label="是否金属漆">
            <Select options={[{ label: '否', value: '0' }, { label: '是', value: '1' }]} />
          </Form.Item>
          <Form.Item name="price" label="选装加价(万)"><InputNumber min={0} step={0.01} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="sortOrder" label="排序"><InputNumber min={0} /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
