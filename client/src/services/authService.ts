import { api } from './api';
import { User } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: { emailOrUsername?: string; email?: string; username?: string; password: string }): Promise<AuthResponse> {
    const res = await api.post('/auth/login', credentials);
    return res.data.data;
  },

  async register(data: { username: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await api.put('/auth/profile', data);
    return res.data.data;
  },
};
