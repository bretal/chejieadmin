import api from './request';

export interface CarColor {
  id?: number;
  carId?: number;
  colorName: string;
  hexValue: string;
  isMetallic?: string;
  price?: number;
  sortOrder?: number;
  status?: string;
}

export function getColorList(params?: Record<string, unknown>) {
  return api.get('/chejie/car-color/list', { params });
}

export function getColor(id: number) {
  return api.get(`/chejie/car-color/${id}`);
}

export function addColor(data: CarColor) {
  return api.post('/chejie/car-color', data);
}

export function updateColor(data: CarColor) {
  return api.put('/chejie/car-color', data);
}

export function deleteColor(ids: number[]) {
  return api.delete(`/chejie/car-color/${ids.join(',')}`);
}
