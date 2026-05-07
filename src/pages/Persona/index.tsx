import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Typography, message, Select, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Persona } from '../../api/persona';
import * as api from '../../api/persona';

const personaKeyOpts = [
  { label: '小白科普', value: 'newbie' },
  { label: '女性视角', value: 'female' },
  { label: '硬核参数', value: 'enthusiast' },
];

export default function PersonaPage() {
  const [data, setData] = useState<Persona[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Persona | null>(null);
  const [form] = Form.useForm();

  const fetch = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res: any = await api.getPersonaList({ pageNum: p, pageSize: 10 });
      setData(res?.rows || []);
      setTotal(res?.total || 0);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ status: '1' }); setModalOpen(true); };
  const openEdit = (record: Persona) => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) await api.updatePersona({ ...values, id: editing.id });
    else await api.addPersona(values);
    setModalOpen(false); message.success(editing ? '更新成功' : '添加成功'); fetch();
  };

  const handleDelete = async (ids: number[]) => { await api.deletePersona(ids); message.success('删除成功'); fetch(); };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '标识', dataIndex: 'personaKey', width: 100, render: (v: string) => <Tag color="purple">{v}</Tag> },
    { title: '名称', dataIndex: 'name', width: 110 },
    { title: '图标', dataIndex: 'icon', width: 60 },
    { title: '欢迎语', dataIndex: 'greeting', ellipsis: true, width: 260 },
    { title: '描述', dataIndex: 'description', ellipsis: true, width: 260 },
    { title: '操作', key: 'action', width: 140,
      render: (_: unknown, r: Persona) => (
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
        <Typography.Title level={3} style={{ color: '#e8e8ed', margin: 0 }}>用户画像</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增画像</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: (p) => { setPage(p); fetch(p); } }}
        locale={{ emptyText: '暂无数据' }} />
      <Modal title={editing ? '编辑画像' : '新增画像'} open={modalOpen} onOk={handleOk} onCancel={() => setModalOpen(false)} width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="personaKey" label="画像标识" rules={[{ required: true }]}>
            <Select options={personaKeyOpts} placeholder="选择画像标识" />
          </Form.Item>
          <Form.Item name="name" label="显示名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="icon" label="图标（emoji）"><Input placeholder="如：🧑‍🎓" /></Form.Item>
          <Form.Item name="greeting" label="欢迎语"><Input placeholder="如：别担心参数看不懂..." /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
