import api from './request';

export interface CarConfig {
  id?: number;
  carId?: number;
  configName: string;
  price: number;
  rangeKm?: number;
  horsepower?: number;
  acceleration?: number;
  features?: string[];
  sensorCount?: number;
  chipModel?: string;
  audioBrand?: string;
  audioSpeakers?: number;
  hasLidar?: string;
  hasAirSuspension?: string;
  isDefault?: string;
  sortOrder?: number;
  status?: string;
}

export function getConfigList(params?: Record<string, unknown>) {
  return api.get('/chejie/car-config/list', { params });
}

export function getConfig(id: number) {
  return api.get(`/chejie/car-config/${id}`);
}

export function addConfig(data: CarConfig) {
  return api.post('/chejie/car-config', data);
}

export function updateConfig(data: CarConfig) {
  return api.put('/chejie/car-config', data);
}

export function deleteConfig(ids: number[]) {
  return api.delete(`/chejie/car-config/${ids.join(',')}`);
}
