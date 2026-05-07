import api from './request';

export interface Banner {
  id?: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder?: number;
  status?: string;
}

export function getBannerList(params?: Record<string, unknown>) {
  return api.get('/chejie/banner/list', { params });
}

export function getBanner(id: number) {
  return api.get(`/chejie/banner/${id}`);
}

export function addBanner(data: Banner) {
  return api.post('/chejie/banner', data);
}

export function updateBanner(data: Banner) {
  return api.put('/chejie/banner', data);
}

export function deleteBanner(ids: number[]) {
  return api.delete(`/chejie/banner/${ids.join(',')}`);
}
