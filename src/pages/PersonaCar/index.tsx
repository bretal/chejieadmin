import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, Typography, message, Select, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { PersonaCar } from '../../api/personaCar';
import * as api from '../../api/personaCar';
import { getCarList, type Car } from '../../api/car';
import { isGuest } from '../../auth/token';

const personaKeyOpts = [
  { label: '小白科普 (newbie)', value: 'newbie' },
  { label: '女性视角 (female)', value: 'female' },
  { label: '硬核参数 (enthusiast)', value: 'enthusiast' },
];

export default function PersonaCarPage() {
  const [data, setData] = useState<PersonaCar[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PersonaCar | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [filterPersona, setFilterPersona] = useState<string | undefined>();
  const [form] = Form.useForm();

  const fetch = useCallback(async (p = page, pk = filterPersona) => {
    setLoading(true);
    try {
      const res: any = await api.getPersonaCarList({ pageNum: p, pageSize: 10, personaKey: pk || undefined });
      setData(res?.rows || []);
      setTotal(res?.total || 0);
    } finally { setLoading(false); }
  }, [page, filterPersona]);

  useEffect(() => { fetch(); getCarList({ pageNum: 1, pageSize: 200 }).then((r: any) => setCars(r?.rows || [])); }, [fetch]);

  const openAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ status: '1', priority: 0 }); setModalOpen(true); };
  const openEdit = (record: PersonaCar) => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) await api.updatePersonaCar({ ...values, id: editing.id });
    else await api.addPersonaCar(values);
    setModalOpen(false); message.success(editing ? '更新成功' : '添加成功'); fetch();
  };

  const handleDelete = async (ids: number[]) => { await api.deletePersonaCar(ids); message.success('删除成功'); fetch(); };

  const getCarName = (id: number) => cars.find((c) => c.id === id)?.name || '-';

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '画像', dataIndex: 'personaKey', width: 130, render: (v: string) => <Tag color={v === 'newbie' ? 'green' : v === 'female' ? 'pink' : 'orange'}>{v}</Tag> },
    { title: '车型', dataIndex: 'carId', width: 130, render: (v: number) => getCarName(v) },
    { title: '优先级', dataIndex: 'priority', width: 70 },
    { title: '推荐理由', dataIndex: 'recommendReason', ellipsis: true, width: 280 },
    { title: '操作', key: 'action', width: 140,
      render: (_: unknown, r: PersonaCar) => (
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
        <Typography.Title level={3} style={{ margin: 0 }}>画像推荐</Typography.Title>
        <Space>
          <Select placeholder="筛选画像" allowClear style={{ width: 180 }}
            options={personaKeyOpts}
            onChange={(v) => { setFilterPersona(v); setPage(1); fetch(1, v); }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={isGuest() ? undefined : openAdd} disabled={isGuest()} title={isGuest() ? '访客模式下无操作权限' : undefined}>新增推荐</Button>
        </Space>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: (p) => { setPage(p); fetch(p); } }}
        locale={{ emptyText: '暂无数据' }} />
      <Modal title={editing ? '编辑推荐' : '新增推荐'} open={modalOpen} onOk={handleOk} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="personaKey" label="画像标识" rules={[{ required: true }]}>
            <Select options={personaKeyOpts} placeholder="选择画像" />
          </Form.Item>
          <Form.Item name="carId" label="车型" rules={[{ required: true }]}>
            <Select options={cars.map((c) => ({ label: c.name, value: c.id }))} placeholder="选择车型" />
          </Form.Item>
          <Form.Item name="priority" label="推荐优先级"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="recommendReason" label="推荐理由"><Input placeholder="如：配置均衡，适合家庭" /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
