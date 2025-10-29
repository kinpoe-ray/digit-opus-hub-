import { apiClient } from './client';
import { Task, PaginatedResponse } from '../types';

export const tasksApi = {
  // 获取任务列表
  getTasks: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    agentId?: string;
  }): Promise<PaginatedResponse<Task>> => {
    const { data } = await apiClient.get('/tasks', { params });
    return data;
  },

  // 获取任务详情
  getTask: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get(`/tasks/${id}`);
    return data;
  },

  // 创建任务
  createTask: async (task: Partial<Task>): Promise<Task> => {
    const { data } = await apiClient.post('/tasks', task);
    return data;
  },

  // 取消任务
  cancelTask: async (id: string): Promise<Task> => {
    const { data } = await apiClient.post(`/tasks/${id}/cancel`);
    return data;
  },
};
