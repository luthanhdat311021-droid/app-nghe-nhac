import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical } from 'lucide-react';
import { Song } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';
import { favoriteService } from '../../services/favoriteService';
import { useAuthStore } from '../../store/useAuthStore';
import { SongActionSheet } from './SongActionSheet';

interface SongCardProps {
  song: Song;
  playlistContext?: Song[];
  onAddToPlaylist?: (song: Song) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, playlistContext, onAddToPlaylist }) => {
  const { currentSong, isPlaying, playSong, togglePlay, toggleFavoriteStatus } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

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
    <>
      <div
        onClick={handlePlayClick}
        className="glass-card p-3 rounded-2xl group relative flex flex-col justify-between select-none cursor-pointer active:scale-95 transition-all"
      >
        {/* Cover Image Container */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2.5">
          <img
            src={song.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80'}
            alt={song.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Touch Play Button Overlay */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${
              isCurrent ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
            }`}
          >
            <div
              className="w-11 h-11 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-glow"
              aria-label="Play song"
            >
              {isCurrent && isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </div>
          </div>

          {/* Top Right Favorite Button */}
          <button
            onClick={handleLikeClick}
            className={`absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-md text-white transition-opacity ${
              song.isFavorite ? 'opacity-100 text-pink-500' : 'opacity-0 md:group-hover:opacity-100 text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${song.isFavorite ? 'fill-pink-500' : ''}`} />
          </button>
        </div>

        {/* Title, Artist & Action Menu Button */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <h4 className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? 'text-purple-400' : 'text-white'}`}>
              {song.title}
            </h4>
            <p className="text-[11px] sm:text-xs text-gray-400 truncate mt-0.5">{song.artist?.name || 'Artist'}</p>
          </div>

          {/* 3-dots Touch Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsActionSheetOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center active:bg-white/10"
            aria-label="Song options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Touch Action Sheet Modal */}
      <SongActionSheet
        song={song}
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        onAddToPlaylist={onAddToPlaylist}
      />
    </>
  );
};
