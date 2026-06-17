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

/** 车型分组响应（无 carId 参数时） */
export interface CarMediaGroup {
  carId: number;
  carName: string;
  thumbnail: string;
  mediaCount: number;
  medias: CarMedia[];
}

export function getMediaList(params?: Record<string, unknown>) {
  return api.get('/chejie/car-media/list', { params });
}

export function getMedia(id: number) {
  return api.get(`/chejie/car-media/${id}`);
}

export function addMedia(data: Partial<CarMedia>) {
  return api.post('/chejie/car-media', data);
}

export function updateMedia(data: Partial<CarMedia> & { id: number }) {
  return api.put('/chejie/car-media', data);
}

export function deleteMedia(ids: number[]) {
  return api.delete(`/chejie/car-media/${ids.join(',')}`);
}
