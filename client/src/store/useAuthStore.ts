import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { emailOrUsername?: string; email?: string; username?: string; password: string }) => Promise<void>;
  register: (data: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  setUser: (user: User) => void;
}

const savedToken = localStorage.getItem('musicwave_token');
const savedUser = localStorage.getItem('musicwave_user');

export const useAuthStore = create<AuthState>((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken,
  isAuthenticated: !!savedToken,
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const data = await authService.login(credentials);
      localStorage.setItem('musicwave_token', data.token);
      localStorage.setItem('musicwave_user', JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (registerData) => {
    set({ isLoading: true });
    try {
      const data = await authService.register(registerData);
      localStorage.setItem('musicwave_token', data.token);
      localStorage.setItem('musicwave_user', JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('musicwave_token');
    localStorage.removeItem('musicwave_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  fetchProfile: async () => {
    if (!localStorage.getItem('musicwave_token')) return;
    try {
      const user = await authService.getCurrentUser();
      localStorage.setItem('musicwave_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (_e) {
      set({ user: null, token: null, isAuthenticated: false });
      localStorage.removeItem('musicwave_token');
      localStorage.removeItem('musicwave_user');
    }
  },

  setUser: (user) => {
    localStorage.setItem('musicwave_user', JSON.stringify(user));
    set({ user });
  },
}));
