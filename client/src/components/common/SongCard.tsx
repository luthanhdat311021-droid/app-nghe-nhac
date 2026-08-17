import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, Plus } from 'lucide-react';
import { Song } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';
import { favoriteService } from '../../services/favoriteService';
import { useAuthStore } from '../../store/useAuthStore';

interface SongCardProps {
  song: Song;
  playlistContext?: Song[];
  onAddToPlaylist?: (song: Song) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, playlistContext, onAddToPlaylist }) => {
  const { currentSong, isPlaying, playSong, togglePlay, toggleFavoriteStatus } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentSong?.id === song.id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="glass-card p-3.5 rounded-2xl group relative flex flex-col justify-between select-none cursor-pointer">
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3">
        <img
          src={song.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80'}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Hover Overlay & Play Button */}
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${
          isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-gradient-primary hover:bg-gradient-hover text-white flex items-center justify-center shadow-glow transform group-hover:scale-110 active:scale-95 transition-all"
            aria-label="Play song"
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Top Right Like Button */}
        <button
          onClick={handleLikeClick}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
        >
          <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-pink-500 text-pink-500' : 'text-white'}`} />
        </button>
      </div>

      {/* Title & Artist */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-bold truncate ${isCurrent ? 'text-purple-400' : 'text-white'}`}>
            {song.title}
          </h4>
          <p className="text-xs text-gray-400 truncate mt-0.5">{song.artist?.name || 'Artist'}</p>
        </div>

        {/* 3-dots Context Menu Button */}
        {onAddToPlaylist && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-44 bg-[#1a1728] border border-white/10 rounded-xl shadow-xl py-1 z-30 animate-in fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onAddToPlaylist(song);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Playlist</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
