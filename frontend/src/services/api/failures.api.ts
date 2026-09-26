import { api } from './client';

export const failuresApi = {
  list:       ()                     => api.get('/failures').then(r => r.data),
  history:    ()                     => api.get('/failures/history').then(r => r.data),
  impact:     ()                     => api.get('/failures/impact').then(r => r.data),
  get:        (id: string)           => api.get(`/failures/${id}`).then(r => r.data),
  create:     (data: any)            => api.post('/failures', data).then(r => r.data),
  acknowledge:(id: string)           => api.patch(`/failures/${id}/acknowledge`).then(r => r.data),
  restore:    (id: string)           => api.patch(`/failures/${id}/restore`).then(r => r.data),
  updateNote: (id: string, note: string) => api.patch(`/failures/${id}/note`, { note }).then(r => r.data),
};
