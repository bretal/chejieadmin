import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, Typography, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import * as api from '../../api/carRival';
import type { CarRival } from '../../api/carRival';
import { getCarList, type Car } from '../../api/car';

export default function CarRivalPage() {
  const [data, setData] = useState<CarRival[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CarRival | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [filterCarId, setFilterCarId] = useState<number | undefined>();
  const [form] = Form.useForm();

  const fetch = useCallback(async (p = page, carId = filterCarId) => {
    setLoading(true);
    try {
      const res: any = await api.getRivalList({ pageNum: p, pageSize: 10, carId: carId || undefined });
      setData(res?.rows || []);
      setTotal(res?.total || 0);
    } finally { setLoading(false); }
  }, [page, filterCarId]);

  useEffect(() => { fetch(); getCarList({ pageNum: 1, pageSize: 200 }).then((r: any) => setCars(r?.rows || [])); }, [fetch]);

  const openAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ status: '1', sortOrder: 0 }); setModalOpen(true); };
  const openEdit = (record: CarRival) => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) await api.updateRival({ ...values, id: editing.id });
    else await api.addRival(values);
    setModalOpen(false); message.success(editing ? '更新成功' : '添加成功'); fetch();
  };

  const handleDelete = async (ids: number[]) => { await api.deleteRival(ids); message.success('删除成功'); fetch(); };

  const getCarName = (id: number) => cars.find((c) => c.id === id)?.name || '-';

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '车型', dataIndex: 'carId', width: 120, render: (v: number) => getCarName(v) },
    { title: '竞品车型', dataIndex: 'rivalCarId', width: 120, render: (v: number) => getCarName(v) },
    { title: '相似度', dataIndex: 'similarityScore', width: 80, render: (v: number) => v ? `${v}%` : '-' },
    { title: '推荐理由', dataIndex: 'rivalReason', ellipsis: true, width: 200 },
    { title: '排序', dataIndex: 'sortOrder', width: 60 },
    { title: '操作', key: 'action', width: 140,
      render: (_: unknown, r: CarRival) => (
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
        <Typography.Title level={3} style={{ color: '#e8e8ed', margin: 0 }}>竞品关系</Typography.Title>
        <Space>
          <Select placeholder="筛选车型" allowClear style={{ width: 160 }}
            options={cars.map((c) => ({ label: c.name, value: c.id }))}
            onChange={(v) => { setFilterCarId(v); setPage(1); fetch(1, v); }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增竞品</Button>
        </Space>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: (p) => { setPage(p); fetch(p); } }}
        locale={{ emptyText: '暂无数据' }} />
      <Modal title={editing ? '编辑竞品' : '新增竞品'} open={modalOpen} onOk={handleOk} onCancel={() => setModalOpen(false)} width={480}>
        <Form form={form} layout="vertical">
          <Form.Item name="carId" label="车型" rules={[{ required: true }]}>
            <Select options={cars.map((c) => ({ label: c.name, value: c.id }))} placeholder="选择车型" />
          </Form.Item>
          <Form.Item name="rivalCarId" label="竞品车型" rules={[{ required: true }]}>
            <Select options={cars.map((c) => ({ label: c.name, value: c.id }))} placeholder="选择竞品车型" />
          </Form.Item>
          <Form.Item name="similarityScore" label="相似度评分(0-100)"><InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="rivalReason" label="推荐理由"><Input placeholder="如同价位、配置相近" /></Form.Item>
          <Form.Item name="sortOrder" label="排序"><InputNumber min={0} /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
