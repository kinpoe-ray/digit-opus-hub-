import { apiClient } from './client';
import { User } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  // 登录
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },

  // 注册
  register: async (userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  },

  // 获取当前用户
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};
