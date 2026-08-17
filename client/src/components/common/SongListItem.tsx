import React from 'react';
import { Play, Pause, Heart, Trash2, Plus } from 'lucide-react';
import { Song } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';
import { favoriteService } from '../../services/favoriteService';
import { useAuthStore } from '../../store/useAuthStore';

interface SongListItemProps {
  song: Song;
  index: number;
  playlistContext?: Song[];
  onRemove?: (songId: string) => void;
  onAddToPlaylist?: (song: Song) => void;
}

export const SongListItem: React.FC<SongListItemProps> = ({
  song,
  index,
  playlistContext,
  onRemove,
  onAddToPlaylist,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay, toggleFavoriteStatus } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();

  const isCurrent = currentSong?.id === song.id;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlistContext);
    }
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    try {
      if (song.isFavorite) {
        await favoriteService.removeFavorite(song.id);
      } else {
        await favoriteService.addFavorite(song.id);
      }
      toggleFavoriteStatus(song.id);
    } catch (_e) {
      // Ignore
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all select-none cursor-pointer border ${
        isCurrent
          ? 'bg-purple-600/15 border-purple-500/30 text-purple-300 shadow-glow'
          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.08] text-gray-300'
      }`}
    >
      {/* Index or Play icon */}
      <div className="w-8 flex items-center justify-center font-bold text-xs text-gray-500 group-hover:text-white">
        {isCurrent ? (
          isPlaying ? (
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-purple-400 eq-bar" />
              <span className="w-1 bg-purple-400 eq-bar" />
              <span className="w-1 bg-purple-400 eq-bar" />
            </div>
          ) : (
            <Play className="w-4 h-4 text-purple-400 fill-current" />
          )
        ) : (
          <span className="group-hover:hidden">{(index + 1).toString().padStart(2, '0')}</span>
        )}
        {!isCurrent && (
          <Play className="w-4 h-4 text-white fill-current hidden group-hover:block" />
        )}
      </div>

      {/* Cover Image */}
      <img
        src={song.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&q=80'}
        alt={song.title}
        className="w-11 h-11 rounded-xl object-cover shadow border border-white/10"
      />

      {/* Title & Artist */}
      <div className="min-w-0 flex-1">
        <h4 className={`text-sm font-bold truncate ${isCurrent ? 'text-purple-300' : 'text-white'}`}>
          {song.title}
        </h4>
        <p className="text-xs text-gray-400 truncate mt-0.5">{song.artist?.name || 'Artist'}</p>
      </div>

      {/* Album Name (if present) */}
      {song.album && (
        <div className="hidden md:block w-48 text-xs text-gray-400 truncate">
          {song.album.title}
        </div>
      )}

      {/* Duration */}
      <div className="text-xs text-gray-400 font-medium">
        {formatDuration(song.duration)}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {onAddToPlaylist && (
          <button
            onClick={() => onAddToPlaylist(song)}
            className="p-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Add to playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleLikeClick}
          className="p-2 text-gray-400 hover:text-pink-400 transition-colors"
          title="Favorite"
        >
          <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
        </button>

        {onRemove && (
          <button
            onClick={() => onRemove(song.id)}
            className="p-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
