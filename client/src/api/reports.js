import api from './client.js';

export const getDashboardSummary = async () => {
  const response = await api.get('/reports/dashboard');
  return response.data;
};

export const getWeeklyReport = async (startDate) => {
  const response = await api.get(`/reports/weekly?startDate=${startDate}`);
  return response.data;
};

export const getMonthlyReport = async (year, month) => {
  const response = await api.get(`/reports/monthly?year=${year}&month=${month}`);
  return response.data;
};