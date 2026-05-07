import api from './request';

export interface PersonaCar {
  id?: number;
  personaKey: string;
  carId?: number;
  priority?: number;
  recommendReason?: string;
  status?: string;
}

export function getPersonaCarList(params?: Record<string, unknown>) {
  return api.get('/chejie/persona-car/list', { params });
}

export function getPersonaCar(id: number) {
  return api.get(`/chejie/persona-car/${id}`);
}

export function addPersonaCar(data: PersonaCar) {
  return api.post('/chejie/persona-car', data);
}

export function updatePersonaCar(data: PersonaCar) {
  return api.put('/chejie/persona-car', data);
}

export function deletePersonaCar(ids: number[]) {
  return api.delete(`/chejie/persona-car/${ids.join(',')}`);
}
