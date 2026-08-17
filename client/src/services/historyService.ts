import { api } from './api';
import { RecentlyPlayed } from '../types';

export const historyService = {
  async getHistory(): Promise<RecentlyPlayed[]> {
    const res = await api.get('/history');
    return res.data.data;
  },

  async recordHistory(songId: string): Promise<void> {
    await api.post('/history', { songId });
  },

  async clearHistory(): Promise<void> {
    await api.delete('/history');
  },
};
