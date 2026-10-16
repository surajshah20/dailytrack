import api from './client.js';

export const getReflection = async (date) => {
  const response = await api.get(`/reflections/${date}`);
  return response.data;
};

export const saveReflection = async (date, data) => {
  const response = await api.put(`/reflections/${date}`, data);
  return response.data;
};