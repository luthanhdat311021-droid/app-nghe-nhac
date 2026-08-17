import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, ListMusic, Trash2, Globe, Lock } from 'lucide-react';
import { playlistService } from '../services/playlistService';
import { Playlist } from '../types';
import { SongListItem } from '../components/common/SongListItem';
import { SkeletonRow } from '../components/common/Skeleton';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';

export const PlaylistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playSong, toggleShuffle } = usePlayerStore();
  const { user } = useAuthStore();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlaylist = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await playlistService.getPlaylistById(id);
      setPlaylist(data);
    } catch (err) {
      console.error('Failed to load playlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const playlistSongs = playlist?.songs?.map((ps) => ps.song) || [];

  const handlePlayAll = () => {
    if (playlistSongs.length > 0) {
      playSong(playlistSongs[0], playlistSongs);
    }
  };

  const handleShuffle = () => {
    if (playlistSongs.length > 0) {
      toggleShuffle();
      const randIdx = Math.floor(Math.random() * playlistSongs.length);
      playSong(playlistSongs[randIdx], playlistSongs);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!id) return;
    try {
      await playlistService.removeSongFromPlaylist(id, songId);
      fetchPlaylist();
    } catch (_e) {
      // Ignore
    }
  };

  const handleDeletePlaylist = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await playlistService.deletePlaylist(id);
      navigate('/library');
    } catch (_e) {
      // Ignore
    }
  };

  if (loading || !playlist) {
    return <SkeletonRow />;
  }

  const isOwner = user?.id === playlist.userId || user?.role === 'ADMIN';

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-8 border-b border-white/10 pb-8">
        <img
          src={playlist.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80'}
          alt={playlist.name}
          className="w-44 h-44 md:w-56 md:h-56 rounded-3xl object-cover shadow-2xl border border-white/10 flex-shrink-0"
        />
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
              <ListMusic className="w-4 h-4" />
              <span>Playlist</span>
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              {playlist.isPublic ? <Globe className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
              <span>{playlist.isPublic ? 'Public' : 'Private'}</span>
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white">{playlist.name}</h1>
          <p className="text-xs md:text-sm text-gray-300 max-w-xl">{playlist.description || 'No description provided.'}</p>

          <p className="text-xs text-gray-400 font-medium">
            Created by <span className="text-white font-bold">{playlist.user?.username || 'User'}</span> • {playlistSongs.length} Songs
          </p>

          <div className="flex items-center gap-4 pt-2">
            {playlistSongs.length > 0 && (
              <>
                <button
                  onClick={handlePlayAll}
                  className="px-6 py-3 rounded-full bg-gradient-primary hover:bg-gradient-hover text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play All</span>
                </button>
                <button
                  onClick={handleShuffle}
                  className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-2 transition-all"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Shuffle</span>
                </button>
              </>
            )}

            {isOwner && (
              <button
                onClick={handleDeletePlaylist}
                className="p-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all ml-auto"
                title="Delete Playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Songs Table */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-white mb-4">Tracks</h2>
        {playlistSongs.map((song, index) => (
          <SongListItem
            key={`${song.id}-${index}`}
            song={song}
            index={index}
            playlistContext={playlistSongs}
            onRemove={isOwner ? handleRemoveSong : undefined}
          />
        ))}
      </div>
    </div>
  );
};
