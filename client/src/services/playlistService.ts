import { api } from './api';
import { Playlist } from '../types';

export const playlistService = {
  async getPlaylists(): Promise<Playlist[]> {
    const res = await api.get('/playlists');
    return res.data.data;
  },

  async getUserPlaylists(): Promise<Playlist[]> {
    const res = await api.get('/playlists/me');
    return res.data.data;
  },

  async getPlaylistById(id: string): Promise<Playlist> {
    const res = await api.get(`/playlists/${id}`);
    return res.data.data;
  },

  async createPlaylist(data: { name: string; description?: string; isPublic?: boolean; coverUrl?: string }): Promise<Playlist> {
    const res = await api.post('/playlists', data);
    return res.data.data;
  },

  async updatePlaylist(id: string, data: { name?: string; description?: string; isPublic?: boolean; coverUrl?: string }): Promise<Playlist> {
    const res = await api.put(`/playlists/${id}`, data);
    return res.data.data;
  },

  async deletePlaylist(id: string): Promise<void> {
    await api.delete(`/playlists/${id}`);
  },

  async addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
    await api.post(`/playlists/${playlistId}/songs`, { songId });
  },

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    await api.delete(`/playlists/${playlistId}/songs/${songId}`);
  },

  async reorderPlaylistSongs(playlistId: string, songIds: string[]): Promise<void> {
    await api.put(`/playlists/${playlistId}/reorder`, { songIds });
  },
};
