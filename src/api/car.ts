import api from './request';

export interface Car {
  id?: number;
  brandId?: number;
  name: string;
  bodyType: string;
  energyType: string;
  thumbnail?: string;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  tags?: string[];
  description?: string;
  sortOrder?: number;
  status?: string;
}

export function getCarList(params?: Record<string, unknown>) {
  return api.get('/chejie/car/list', { params });
}

export function getCar(id: number) {
  return api.get(`/chejie/car/${id}`);
}

export function addCar(data: Car) {
  return api.post('/chejie/car', data);
}

export function updateCar(data: Car) {
  return api.put('/chejie/car', data);
}

export function deleteCar(ids: number[]) {
  return api.delete(`/chejie/car/${ids.join(',')}`);
}
