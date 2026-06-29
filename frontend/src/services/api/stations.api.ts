import { api } from './client';

export const stationsApi = {
  list: () => api.get('/stations').then((r) => r.data),
  create: (data: any) => api.post('/stations', data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/stations/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/stations/${id}`).then((r) => r.data),
};
