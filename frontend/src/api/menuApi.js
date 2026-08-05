import api from './client';

export const getMenuItems = (params = {}) => api.get('/menu', { params });
export const getTonightMenu = (params = {}) => api.get('/menu/tonight', { params });
export const getMenuItem = (id) => api.get(`/menu/${id}`);
export const createMenuItem = (data) => api.post('/menu', data);
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data);
export const toggleAvailability = (id) => api.patch(`/menu/${id}/toggle`);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);
