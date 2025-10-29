import { apiClient } from './client';
import { Agent, PaginatedResponse } from '../types';

export const agentsApi = {
  // 获取 Agent 列表
  getAgents: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<PaginatedResponse<Agent>> => {
    const { data } = await apiClient.get('/agents', { params });
    return data;
  },

  // 获取 Agent 详情
  getAgent: async (id: string): Promise<Agent> => {
    const { data } = await apiClient.get(`/agents/${id}`);
    return data;
  },

  // 创建 Agent
  createAgent: async (agent: Partial<Agent>): Promise<Agent> => {
    const { data } = await apiClient.post('/agents', agent);
    return data;
  },

  // 更新 Agent
  updateAgent: async (id: string, agent: Partial<Agent>): Promise<Agent> => {
    const { data } = await apiClient.put(`/agents/${id}`, agent);
    return data;
  },

  // 删除 Agent
  deleteAgent: async (id: string): Promise<void> => {
    await apiClient.delete(`/agents/${id}`);
  },

  // 切换 Agent 状态
  toggleAgent: async (id: string): Promise<Agent> => {
    const { data } = await apiClient.post(`/agents/${id}/toggle`);
    return data;
  },
};
