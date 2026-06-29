import { api } from './client';

export const dashboardApi = {
  overview: () => api.get('/dashboard/overview').then((r) => r.data),
};

export const simulationsApi = {
  history: () => api.get('/simulations').then((r) => r.data),
  current: () => api.get('/simulations/current').then((r) => r.data),
};
