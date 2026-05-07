import api from './request';

export interface CarMedia {
  id?: number;
  carId?: number;
  mediaType: string;
  url: string;
  compressedUrl?: string;
  isThumbnail?: string;
  sortOrder?: number;
  status?: string;
}

export function getMediaList(params?: Record<string, unknown>) {
  return api.get('/chejie/car-media/list', { params });
}

export function getMedia(id: number) {
  return api.get(`/chejie/car-media/${id}`);
}

export function addMedia(data: CarMedia) {
  return api.post('/chejie/car-media', data);
}

export function updateMedia(data: CarMedia) {
  return api.put('/chejie/car-media', data);
}

export function deleteMedia(ids: number[]) {
  return api.delete(`/chejie/car-media/${ids.join(',')}`);
}
