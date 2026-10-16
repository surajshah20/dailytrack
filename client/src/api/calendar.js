import api from './client.js';

export const getCalendarData = async (year, month) => {
  const response = await api.get(`/calendar?year=${year}&month=${month}`);
  return response.data;
};