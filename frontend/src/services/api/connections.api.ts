import { api } from './client';

export const connectionsApi = {
  list: () => api.get('/connections').then((r) => r.data),
  create: (data: any) => api.post('/connections', data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/connections/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/connections/${id}`).then((r) => r.data),
};

export const portsApi = {
  listByEquipment: (equipmentId: string) => api.get('/ports', { params: { equipmentId } }).then((r) => r.data),
};
