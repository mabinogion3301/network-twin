import { api } from './client';

export const equipmentsApi = {
  list: (params?: Record<string, string>) => api.get('/equipments', { params }).then((r) => r.data),
  create: (data: any) => api.post('/equipments', data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/equipments/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/equipments/${id}`).then((r) => r.data),
};

export const equipmentTypesApi = {
  list: () => api.get('/equipment-types').then((r) => r.data),
};
