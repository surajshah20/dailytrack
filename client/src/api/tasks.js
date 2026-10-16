import api from './client.js';

export const getTasks = async (date) => {
  const response = await api.get(`/tasks?date=${date}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const toggleTaskStatus = async (id) => {
  const response = await api.patch(`/tasks/${id}/status`);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

export const reorderTasks = async (tasks) => {
  const response = await api.post('/tasks/reorder', { tasks });
  return response.data;
};