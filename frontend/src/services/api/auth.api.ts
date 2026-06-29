import { api } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: (payload: LoginPayload) => api.post('/auth/login', payload).then((r) => r.data),
};

export interface TopologyFilters {
  city?: string;
  stationId?: string;
  typeId?: string;
  status?: string;
}

export const topologyApi = {
  get: (filters: TopologyFilters = {}) =>
    api.get('/topology', { params: filters }).then((r) => r.data),
  filterOptions: () => api.get('/topology/filters').then((r) => r.data),
  geo: () => api.get('/topology/geo').then((r) => r.data),
};
