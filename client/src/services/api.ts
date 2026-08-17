import axios from 'axios';

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_URL = (import.meta as any).env?.VITE_API_URL || (isLocalhost ? 'http://localhost:5000/api' : '/api');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('musicwave_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('musicwave_token');
      localStorage.removeItem('musicwave_user');
    }
    return Promise.reject(error);
  }
);
