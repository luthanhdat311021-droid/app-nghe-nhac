import { api } from './api';
import { Song } from '../types';

export const favoriteService = {
  async getFavorites(): Promise<Song[]> {
    const res = await api.get('/favorites');
    return res.data.data;
  },

  async addFavorite(songId: string): Promise<void> {
    await api.post(`/favorites/${songId}`);
  },

  async removeFavorite(songId: string): Promise<void> {
    await api.delete(`/favorites/${songId}`);
  },
};
