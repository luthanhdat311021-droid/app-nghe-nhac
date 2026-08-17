import { api } from './api';
import { Artist } from '../types';

export const artistService = {
  async getArtists(params?: { search?: string }): Promise<Artist[]> {
    const res = await api.get('/artists', { params });
    return res.data.data;
  },

  async getPopularArtists(): Promise<Artist[]> {
    const res = await api.get('/artists/popular');
    return res.data.data;
  },

  async getArtistById(id: string): Promise<Artist> {
    const res = await api.get(`/artists/${id}`);
    return res.data.data;
  },

  async createArtist(data: Partial<Artist>): Promise<Artist> {
    const res = await api.post('/artists', data);
    return res.data.data;
  },

  async followArtist(id: string): Promise<void> {
    await api.post(`/artists/${id}/follow`);
  },

  async unfollowArtist(id: string): Promise<void> {
    await api.delete(`/artists/${id}/follow`);
  },
};
