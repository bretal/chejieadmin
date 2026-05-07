import api from './request';

export interface CarRival {
  id?: number;
  carId?: number;
  rivalCarId?: number;
  similarityScore?: number;
  rivalReason?: string;
  sortOrder?: number;
  status?: string;
}

export function getRivalList(params?: Record<string, unknown>) {
  return api.get('/chejie/car-rival/list', { params });
}

export function getRival(id: number) {
  return api.get(`/chejie/car-rival/${id}`);
}

export function addRival(data: CarRival) {
  return api.post('/chejie/car-rival', data);
}

export function updateRival(data: CarRival) {
  return api.put('/chejie/car-rival', data);
}

export function deleteRival(ids: number[]) {
  return api.delete(`/chejie/car-rival/${ids.join(',')}`);
}
