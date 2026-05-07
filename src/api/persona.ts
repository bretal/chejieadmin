import api from './request';

export interface Persona {
  id?: number;
  personaKey: string;
  name: string;
  icon?: string;
  greeting?: string;
  description?: string;
  status?: string;
}

export function getPersonaList(params?: Record<string, unknown>) {
  return api.get('/chejie/persona/list', { params });
}

export function getPersona(id: number) {
  return api.get(`/chejie/persona/${id}`);
}

export function addPersona(data: Persona) {
  return api.post('/chejie/persona', data);
}

export function updatePersona(data: Persona) {
  return api.put('/chejie/persona', data);
}

export function deletePersona(ids: number[]) {
  return api.delete(`/chejie/persona/${ids.join(',')}`);
}
