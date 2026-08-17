import { api } from './api';
import { Album } from '../types';

export const albumService = {
  async getAlbums(params?: { search?: string }): Promise<Album[]> {
    const res = await api.get('/albums', { params });
    return res.data.data;
  },

  async getPopularAlbums(): Promise<Album[]> {
    const res = await api.get('/albums/popular');
    return res.data.data;
  },

  async getAlbumById(id: string): Promise<Album> {
    const res = await api.get(`/albums/${id}`);
    return res.data.data;
  },
};
