import { apiClient } from './client';
import { DashboardStats } from '../types';

export const dashboardApi = {
  // 获取统计数据
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get('/dashboard/stats');
    return data;
  },
};
