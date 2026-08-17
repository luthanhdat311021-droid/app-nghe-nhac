import { api } from './api';
import { AdminStats, Song, Artist, Album, User } from '../types';

export const adminService = {
  async getDashboardStats(): Promise<AdminStats> {
    const res = await api.get('/admin/stats');
    return res.data.data;
  },

  // Songs CRUD
  async createSong(data: Partial<Song>): Promise<Song> {
    const res = await api.post('/admin/songs', data);
    return res.data.data;
  },

  async updateSong(id: string, data: Partial<Song>): Promise<Song> {
    const res = await api.put(`/admin/songs/${id}`, data);
    return res.data.data;
  },

  async deleteSong(id: string): Promise<void> {
    await api.delete(`/admin/songs/${id}`);
  },

  // Artists CRUD
  async createArtist(data: Partial<Artist>): Promise<Artist> {
    const res = await api.post('/admin/artists', data);
    return res.data.data;
  },

  async updateArtist(id: string, data: Partial<Artist>): Promise<Artist> {
    const res = await api.put(`/admin/artists/${id}`, data);
    return res.data.data;
  },

  async deleteArtist(id: string): Promise<void> {
    await api.delete(`/admin/artists/${id}`);
  },

  // Albums CRUD
  async createAlbum(data: Partial<Album>): Promise<Album> {
    const res = await api.post('/admin/albums', data);
    return res.data.data;
  },

  async updateAlbum(id: string, data: Partial<Album>): Promise<Album> {
    const res = await api.put(`/admin/albums/${id}`, data);
    return res.data.data;
  },

  async deleteAlbum(id: string): Promise<void> {
    await api.delete(`/admin/albums/${id}`);
  },

  // User Management
  async getUsers(params?: { search?: string }): Promise<User[]> {
    const res = await api.get('/admin/users', { params });
    return res.data.data;
  },

  async toggleLockUser(id: string, isLocked: boolean): Promise<User> {
    const res = await api.put(`/admin/users/${id}/lock`, { isLocked });
    return res.data.data;
  },

  async updateUserRole(id: string, role: 'USER' | 'ADMIN'): Promise<User> {
    const res = await api.put(`/admin/users/${id}/role`, { role });
    return res.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },
};
