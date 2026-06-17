import { useState } from 'react';
import { Upload, Image, Button, message } from 'antd';
import { PlusOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { uploadImage } from '../../api/upload';

interface Props {
  value?: string;
  onChange?: (url: string) => void;
  maxSize?: number; // MB
}

export default function ImageUpload({ value, onChange, maxSize = 10 }: Props) {
  const [loading, setLoading] = useState(false);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const file = options.file as File;

    // 文件校验
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      options.onError?.(new Error('只能上传图片文件'));
      return;
    }
    const isLt = file.size / 1024 / 1024 < maxSize;
    if (!isLt) {
      message.error(`图片大小不能超过 ${maxSize}MB`);
      options.onError?.(new Error('图片大小超限'));
      return;
    }

    setLoading(true);
    try {
      const result = await uploadImage(file);
      onChange?.(result.url);
      options.onSuccess?.(result);
      message.success('上传成功');
    } catch (err: any) {
      message.error(err?.message || '上传失败');
      options.onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onChange?.('');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <Upload
        listType="picture-card"
        showUploadList={false}
        customRequest={handleUpload}
        accept="image/*"
      >
        {value ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Image
              src={value}
              alt=""
              style={{ width: 102, height: 102, objectFit: 'cover', borderRadius: 8 }}
              preview={{ mask: '预览' }}
            />
          </div>
        ) : (
          <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>上传图片</div>
          </div>
        )}
      </Upload>

      {value && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Image
            src={value}
            alt=""
            width={80}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }}
          />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={handleRemove}>
            移除
          </Button>
        </div>
      )}
    </div>
  );
}
