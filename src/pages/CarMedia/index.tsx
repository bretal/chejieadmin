import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, Typography, message, Select, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { CarMedia } from '../../api/carMedia';
import * as api from '../../api/carMedia';
import { getCarList, type Car } from '../../api/car';
import { isGuest } from '../../auth/token';

const mediaTypeOpts = [
  { label: '图片', value: 'image' }, { label: '视频', value: 'video' }, { label: '3D模型', value: 'model_3d' },
];

export default function CarMediaPage() {
  const [data, setData] = useState<CarMedia[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CarMedia | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [filterCarId, setFilterCarId] = useState<number | undefined>();
  const [form] = Form.useForm();

  const fetch = useCallback(async (p = page, carId = filterCarId) => {
    setLoading(true);
    try {
      const res: any = await api.getMediaList({ pageNum: p, pageSize: 10, carId: carId || undefined });
      setData(res?.rows || []);
      setTotal(res?.total || 0);
    } finally { setLoading(false); }
  }, [page, filterCarId]);

  useEffect(() => { fetch(); getCarList({ pageNum: 1, pageSize: 200 }).then((r: any) => setCars(r?.rows || [])); }, [fetch]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: '1', sortOrder: 0, isThumbnail: '0' });
    setModalOpen(true);
  };

  const openEdit = (record: CarMedia) => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) await api.updateMedia({ ...values, id: editing.id });
    else await api.addMedia(values);
    setModalOpen(false);
    message.success(editing ? '更新成功' : '添加成功');
    fetch();
  };

  const handleDelete = async (ids: number[]) => { await api.deleteMedia(ids); message.success('删除成功'); fetch(); };

  const getCarName = (id: number) => cars.find((c) => c.id === id)?.name || '-';

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '车型', dataIndex: 'carId', width: 120, render: (v: number) => getCarName(v) },
    { title: '类型', dataIndex: 'mediaType', width: 90, render: (v: string) => <Tag color={v === 'model_3d' ? 'purple' : v === 'video' ? 'blue' : 'green'}>{mediaTypeOpts.find((o) => o.value === v)?.label || v}</Tag> },
    { title: 'URL', dataIndex: 'url', ellipsis: true, width: 260 },
    { title: '缩略图', dataIndex: 'isThumbnail', width: 70, render: (v: string) => v === '1' ? <Tag color="orange">是</Tag> : <Tag>否</Tag> },
    { title: '排序', dataIndex: 'sortOrder', width: 60 },
    { title: '操作', key: 'action', width: 140,
      render: (_: unknown, r: CarMedia) => (
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
        <Typography.Title level={3} style={{ margin: 0 }}>媒体管理</Typography.Title>
        <Space>
          <Select placeholder="筛选车型" allowClear style={{ width: 160 }}
            options={cars.map((c) => ({ label: c.name, value: c.id }))}
            onChange={(v) => { setFilterCarId(v); setPage(1); fetch(1, v); }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={isGuest() ? undefined : openAdd} disabled={isGuest()} title={isGuest() ? '访客模式下无操作权限' : undefined}>新增媒体</Button>
        </Space>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: (p) => { setPage(p); fetch(p); } }}
        locale={{ emptyText: '暂无数据' }} />
      <Modal title={editing ? '编辑媒体' : '新增媒体'} open={modalOpen} onOk={handleOk} onCancel={() => setModalOpen(false)} width={680}>
        <Form form={form} layout="vertical">
          <Form.Item name="carId" label="所属车型" rules={[{ required: true }]}>
            <Select options={cars.map((c) => ({ label: c.name, value: c.id }))} placeholder="选择车型" />
          </Form.Item>
          <Form.Item name="mediaType" label="媒体类型" rules={[{ required: true }]}>
            <Select options={mediaTypeOpts} />
          </Form.Item>
          <Form.Item name="url" label="文件URL" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="compressedUrl" label="压缩版URL"><Input /></Form.Item>
          <Form.Item name="isThumbnail" label="是否缩略图">
            <Select options={[{ label: '否', value: '0' }, { label: '是', value: '1' }]} />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序"><InputNumber min={0} /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
