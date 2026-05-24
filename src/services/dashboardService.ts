import type { DashboardData } from '@/types';
import api from './api';

export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get<DashboardData>('/dashboard');
  return data;
};
