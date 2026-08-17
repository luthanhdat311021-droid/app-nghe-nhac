import { api } from './api';
import { Song, Genre } from '../types';

export const songService = {
  async getSongs(params?: { genre?: string; search?: string; page?: number; limit?: number }): Promise<Song[]> {
    const res = await api.get('/songs', { params });
    return res.data.data;
  },

  async getTrendingSongs(): Promise<Song[]> {
    const res = await api.get('/songs/trending');
    return res.data.data;
  },

  async getRecommendedSongs(): Promise<Song[]> {
    const res = await api.get('/songs/recommended');
    return res.data.data;
  },

  async getNewReleases(): Promise<Song[]> {
    const res = await api.get('/songs/new-releases');
    return res.data.data;
  },

  async getSongById(id: string): Promise<Song> {
    const res = await api.get(`/songs/${id}`);
    return res.data.data;
  },

  async getGenres(): Promise<Genre[]> {
    const res = await api.get('/genres');
    return res.data.data;
  },

  async recordPlay(id: string): Promise<void> {
    await api.post(`/songs/${id}/play`);
  },
};
