import axios from 'axios';
import { getToken } from '../auth/token';

interface UploadResult {
  url: string;
  key: string;
}

/** 上传图片到后端 */
export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();

  const res = await axios.post<{ code: number; msg: string; data: UploadResult }>(
    '/v1/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 30000,
    },
  );

  const body = res.data;
  if (body.code === 200 && body.data) {
    return body.data;
  }
  throw new Error(body.msg || '上传失败');
}
