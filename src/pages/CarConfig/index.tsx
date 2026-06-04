import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, Typography, message, Select, Tag, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { CarConfig } from '../../api/carConfig';
import * as api from '../../api/carConfig';
import { getCarList, type Car } from '../../api/car';
import { isGuest } from '../../auth/token';

export default function CarConfigPage() {
  const [data, setData] = useState<CarConfig[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CarConfig | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [filterCarId, setFilterCarId] = useState<number | undefined>();
  const [form] = Form.useForm();

  const fetch = useCallback(async (p = page, carId = filterCarId) => {
    setLoading(true);
    try {
      const res: any = await api.getConfigList({ pageNum: p, pageSize: 10, carId: carId || undefined });
      setData(res?.rows || []);
      setTotal(res?.total || 0);
    } finally { setLoading(false); }
  }, [page, filterCarId]);

  useEffect(() => { fetch(); getCarList({ pageNum: 1, pageSize: 200 }).then((r: any) => setCars(r?.rows || [])); }, [fetch]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: '1', sortOrder: 0, hasLidar: '0', hasAirSuspension: '0', isDefault: '0' });
    setModalOpen(true);
  };

  const openEdit = (record: CarConfig) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) await api.updateConfig({ ...values, id: editing.id });
    else await api.addConfig(values);
    setModalOpen(false);
    message.success(editing ? '更新成功' : '添加成功');
    fetch();
  };

  const handleDelete = async (ids: number[]) => { await api.deleteConfig(ids); message.success('删除成功'); fetch(); };

  const getCarName = (id: number) => cars.find((c) => c.id === id)?.name || '-';

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '车型', dataIndex: 'carId', width: 120, render: (v: number) => getCarName(v) },
    { title: '配置名称', dataIndex: 'configName', width: 130 },
    { title: '价格(万)', dataIndex: 'price', width: 90, render: (v: number) => <span style={{ color: '#f59e0b' }}>{v}万</span> },
    { title: '续航km', dataIndex: 'rangeKm', width: 80 },
    { title: '马力ps', dataIndex: 'horsepower', width: 80 },
    { title: '加速(s)', dataIndex: 'acceleration', width: 80 },
    { title: '芯片', dataIndex: 'chipModel', width: 120 },
    { title: '雷达', dataIndex: 'hasLidar', width: 60, render: (v: string) => v === '1' ? <Tag color="green">有</Tag> : <Tag>无</Tag> },
    { title: '空悬', dataIndex: 'hasAirSuspension', width: 60, render: (v: string) => v === '1' ? <Tag color="green">有</Tag> : <Tag>无</Tag> },
    { title: '操作', key: 'action', width: 140, render: (_: unknown, r: CarConfig) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(r)} disabled={isGuest()} title={isGuest() ? '访客模式下无操作权限' : undefined}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete([r.id!])}>
            <Button type="link" icon={<DeleteOutlined />} disabled={isGuest()} title={isGuest() ? '访客模式下无操作权限' : undefined} style={{ color: '#ef4444' }}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>配置管理</Typography.Title>
        <Space>
          <Select placeholder="筛选车型" allowClear style={{ width: 160 }}
            options={cars.map((c) => ({ label: c.name, value: c.id }))}
            onChange={(v) => { setFilterCarId(v); setPage(1); fetch(1, v); }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={isGuest() ? undefined : openAdd} disabled={isGuest()} title={isGuest() ? '访客模式下无操作权限' : undefined}>新增配置</Button>
        </Space>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: (p) => { setPage(p); fetch(p); } }}
        scroll={{ x: 1000 }} locale={{ emptyText: '暂无数据' }} />
      <Modal title={editing ? '编辑配置' : '新增配置'} open={modalOpen} onOk={handleOk} onCancel={() => setModalOpen(false)} width={780}>
        <Form form={form} layout="vertical">
          <Form.Item name="carId" label="所属车型" rules={[{ required: true }]}>
            <Select options={cars.map((c) => ({ label: c.name, value: c.id }))} placeholder="选择车型" />
          </Form.Item>
          <Form.Item name="configName" label="配置名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="price" label="价格(万)" rules={[{ required: true }]}><InputNumber min={0} step={0.01} style={{ width: '100%' }} /></Form.Item>
          <Space size={16}>
            <Form.Item name="rangeKm" label="续航(km)"><InputNumber min={0} /></Form.Item>
            <Form.Item name="horsepower" label="马力(ps)"><InputNumber min={0} /></Form.Item>
            <Form.Item name="acceleration" label="加速(s)"><InputNumber min={0} step={0.1} /></Form.Item>
          </Space>
          <Space size={16}>
            <Form.Item name="sensorCount" label="传感器数"><InputNumber min={0} /></Form.Item>
            <Form.Item name="audioSpeakers" label="扬声器数"><InputNumber min={0} /></Form.Item>
          </Space>
          <Form.Item name="chipModel" label="智驾芯片"><Input /></Form.Item>
          <Form.Item name="audioBrand" label="音响品牌"><Input /></Form.Item>
          <Space size={24}>
            <Form.Item name="hasLidar" label="激光雷达" valuePropName="checked">
              <Switch checkedChildren="有" unCheckedChildren="无" onChange={(v) => form.setFieldValue('hasLidar', v ? '1' : '0')} />
            </Form.Item>
            <Form.Item name="hasAirSuspension" label="空气悬挂" valuePropName="checked">
              <Switch checkedChildren="有" unCheckedChildren="无" onChange={(v) => form.setFieldValue('hasAirSuspension', v ? '1' : '0')} />
            </Form.Item>
            <Form.Item name="isDefault" label="默认配置" valuePropName="checked">
              <Switch checkedChildren="是" unCheckedChildren="否" onChange={(v) => form.setFieldValue('isDefault', v ? '1' : '0')} />
            </Form.Item>
          </Space>
          <Form.Item name="sortOrder" label="排序"><InputNumber min={0} /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
