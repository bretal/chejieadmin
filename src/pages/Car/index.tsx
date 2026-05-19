import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, Typography, message, Select, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Car } from '../../api/car';
import * as api from '../../api/car';
import { getAllBrands, type Brand } from '../../api/brand';

const bodyTypeOpts = [
  { label: '轿车', value: 'sedan' }, { label: 'SUV', value: 'suv' },
  { label: 'MPV', value: 'mpv' }, { label: '轿跑', value: 'coupe' }, { label: '两厢', value: 'hatchback' },
];
const energyTypeOpts = [
  { label: '纯电', value: 'ev' }, { label: '插混', value: 'phev' },
  { label: '增程', value: 'erev' }, { label: '燃油', value: 'ice' },
];

export default function CarPage() {
  const [data, setData] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Car | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchName, setSearchName] = useState('');
  const [form] = Form.useForm();

  const fetch = useCallback(async (p = page, name = searchName) => {
    setLoading(true);
    try {
      const res: any = await api.getCarList({ pageNum: p, pageSize: 10, name: name || undefined });
      setData(res?.rows || []);
      setTotal(res?.total || 0);
    } finally { setLoading(false); }
  }, [page, searchName]);

  useEffect(() => { fetch(); getAllBrands().then((r: any) => setBrands(r?.data || [])); }, [fetch]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: '1', sortOrder: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: Car) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) {
      await api.updateCar({ ...values, id: editing.id });
    } else {
      await api.addCar(values);
    }
    setModalOpen(false);
    message.success(editing ? '更新成功' : '添加成功');
    fetch();
  };

  const handleDelete = async (ids: number[]) => {
    await api.deleteCar(ids);
    message.success('删除成功');
    fetch();
  };

  const getBrandName = (id: number) => brands.find((b) => b.id === id)?.name || '-';

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '车型名称', dataIndex: 'name', width: 140 },
    { title: '品牌', dataIndex: 'brandId', width: 80, render: (v: number) => getBrandName(v) },
    {
      title: '车身类型', dataIndex: 'bodyType', width: 80,
      render: (v: string) => <Tag>{bodyTypeOpts.find((o) => o.value === v)?.label || v}</Tag>,
    },
    {
      title: '能源类型', dataIndex: 'energyType', width: 80,
      render: (v: string) => <Tag color="blue">{energyTypeOpts.find((o) => o.value === v)?.label || v}</Tag>,
    },
    { title: '排序', dataIndex: 'sortOrder', width: 60 },
    { title: '操作', key: 'action', width: 160,
      render: (_: unknown, record: Car) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete([record.id!])}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>车型管理</Typography.Title>
        <Space>
          <Input.Search placeholder="搜索车型" allowClear style={{ width: 200 }}
            onSearch={(v) => { setSearchName(v); setPage(1); fetch(1, v); }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增车型</Button>
        </Space>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: (p) => { setPage(p); fetch(p); } }}
        locale={{ emptyText: '暂无数据' }} />
      <Modal title={editing ? '编辑车型' : '新增车型'} open={modalOpen} onOk={handleOk} onCancel={() => setModalOpen(false)} width={780}>
        <Form form={form} layout="vertical">
          <Form.Item name="brandId" label="品牌" rules={[{ required: true }]}>
            <Select options={brands.map((b) => ({ label: b.name, value: b.id }))} placeholder="选择品牌" />
          </Form.Item>
          <Form.Item name="name" label="车型名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Space size={16}>
            <Form.Item name="bodyType" label="车身类型" rules={[{ required: true }]}><Select options={bodyTypeOpts} style={{ width: 130 }} /></Form.Item>
            <Form.Item name="energyType" label="能源类型" rules={[{ required: true }]}><Select options={energyTypeOpts} style={{ width: 130 }} /></Form.Item>
          </Space>
          <Form.Item name="thumbnail" label="缩略图URL"><Input /></Form.Item>
          <Space size={16}>
            <Form.Item name="lengthMm" label="车长(mm)"><InputNumber min={0} /></Form.Item>
            <Form.Item name="widthMm" label="车宽(mm)"><InputNumber min={0} /></Form.Item>
            <Form.Item name="heightMm" label="车高(mm)"><InputNumber min={0} /></Form.Item>
            <Form.Item name="wheelbaseMm" label="轴距(mm)"><InputNumber min={0} /></Form.Item>
          </Space>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="sortOrder" label="排序"><InputNumber min={0} /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
