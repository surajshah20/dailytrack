import api from './client.js';

export const getActiveSession = async () => {
  const response = await api.get('/work-sessions/active');
  return response.data;
};

export const startSession = async (payload) => {
  const response = await api.post('/work-sessions/start', payload);
  return response.data;
};

export const stopSession = async (id, payload = {}) => {
  const response = await api.post(`/work-sessions/${id}/stop`, payload);
  return response.data;
};

export const logManualSession = async (payload) => {
  const response = await api.post('/work-sessions/manual', payload);
  return response.data;
};

export const getSessions = async (date) => {
  const response = await api.get(`/work-sessions?date=${date}`);
  return response.data;
};

export const deleteSession = async (id) => {
  const response = await api.delete(`/work-sessions/${id}`);
  return response.data;
};