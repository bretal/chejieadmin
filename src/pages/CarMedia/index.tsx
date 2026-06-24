import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Popconfirm, Typography, message, Image, Upload } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { CarMedia, CarMediaGroup } from '../../api/carMedia';
import * as api from '../../api/carMedia';
import { isGuest } from '../../auth/token';
import { uploadImage } from '../../api/upload';

export default function CarMediaPage() {
  const [data, setData] = useState<CarMediaGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<CarMediaGroup | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetch = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res: any = await api.getMediaList({ pageNum: p, pageSize: 10 });
      setData(res?.rows || []);
      setTotal(res?.total || 0);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openEdit = (record: CarMediaGroup) => {
    setSelected(record);
    setModalOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadImage(file);
      await api.addMedia({
        carId: selected!.carId,
        mediaType: 'image',
        url: result.url,
        sortOrder: (selected!.medias || []).length,
      });
      message.success('上传成功');
      // 刷新当前车的媒体列表
      const updated = { ...selected! };
      updated.medias = [...updated.medias, { url: result.url, mediaType: 'image', sortOrder: updated.medias.length } as CarMedia];
      updated.mediaCount = updated.medias.length;
      setSelected(updated);
      fetch();
    } catch (err: any) {
      message.error(err?.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    await api.deleteMedia([mediaId]);
    message.success('删除成功');
    if (selected) {
      const updated = { ...selected, medias: selected.medias.filter((m) => m.id !== mediaId), mediaCount: selected.mediaCount - 1 };
      setSelected(updated);
    }
    fetch();
  };

  const handleSetThumbnail = async (media: CarMedia) => {
    // 取消其他缩略图 + 设置当前
    await Promise.all(
      (selected!.medias || []).map((m) =>
        api.updateMedia({ id: m.id!, isThumbnail: m.id === media.id ? '1' : '0' }),
      ),
    );
    message.success('已设为缩略图');
    const updated = { ...selected! };
    updated.medias = updated.medias.map((m) => ({ ...m, isThumbnail: m.id === media.id ? '1' : '0' }));
    updated.thumbnail = media.url;
    setSelected(updated);
    fetch();
  };

  const columns = [
    { title: 'ID', dataIndex: 'carId', width: 50 },
    {
      title: '缩略图', dataIndex: 'thumbnail', width: 80,
      render: (v: string) => v ? <Image src={v} width={48} height={36} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '-',
    },
    { title: '车型', dataIndex: 'carName', width: 140 },
    { title: '图片数量', dataIndex: 'mediaCount', width: 80, render: (v: number) => `${v} 张` },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: unknown, r: CarMediaGroup) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(r)} disabled={isGuest()}>编辑</Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>媒体管理</Typography.Title>
      </div>
      <Table rowKey="carId" columns={columns} dataSource={data} loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: (p) => { setPage(p); fetch(p); } }}
        locale={{ emptyText: '暂无数据' }} />

      <Modal
        title={selected ? `${selected.carName} — 媒体图片` : ''}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={900}
      >
        {selected && (
          <div>
            {/* 上传区 */}
            <div style={{ marginBottom: 20 }}>
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={(file) => { handleUpload(file); return false; }}
                disabled={uploading || isGuest()}
              >
                <Button icon={<PlusOutlined />} loading={uploading} disabled={isGuest()}>
                  上传图片
                </Button>
              </Upload>
            </div>

            {/* 图片网格 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {(selected.medias || []).map((media) => (
                <div key={media.id}
                  style={{
                    width: 180, border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden',
                    borderColor: media.isThumbnail === '1' ? '#2979ff' : '#f0f0f0',
                  }}
                >
                  <Image
                    src={media.url}
                    width="100%"
                    height={120}
                    style={{ objectFit: 'cover', display: 'block' }}
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNjY2MiIGZvbnQtc2l6ZT0iMTQiPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4="
                  />
                  <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {media.isThumbnail === '1' ? (
                      <span style={{ fontSize: 12, color: '#2979ff', fontWeight: 600 }}>封面</span>
                    ) : (
                      <Button size="small" type="link" style={{ fontSize: 12, padding: 0 }}
                        onClick={() => handleSetThumbnail(media)} disabled={isGuest()}>
                        设为封面
                      </Button>
                    )}
                    <Popconfirm title="确定删除?" onConfirm={() => handleDeleteMedia(media.id!)}>
                      <Button size="small" type="link" danger style={{ fontSize: 12, padding: 0 }} disabled={isGuest()}>删除</Button>
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>

            {(!selected.medias || selected.medias.length === 0) && (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无图片，请上传</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
