import api from './request';

export interface Brand {
  id?: number;
  name: string;
  logo?: string;
  country?: string;
  firstLetter?: string;
  description?: string;
  sortOrder?: number;
  status?: string;
}

export function getBrandList(params?: { pageNum?: number; pageSize?: number; name?: string }) {
  return api.get('/chejie/brand/list', { params });
}

export function getAllBrands() {
  return api.get('/chejie/brand/all');
}

export function getBrand(id: number) {
  return api.get(`/chejie/brand/${id}`);
}

export function addBrand(data: Brand) {
  return api.post('/chejie/brand', data);
}

export function updateBrand(data: Brand) {
  return api.put('/chejie/brand', data);
}

export function deleteBrand(ids: number[]) {
  return api.delete(`/chejie/brand/${ids.join(',')}`);
}
