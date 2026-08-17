import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Heart,
  PlusCircle,
  Share2,
  Mic2,
  Disc,
  X,
} from 'lucide-react';
import { Song } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';
import { favoriteService } from '../../services/favoriteService';
import { useAuthStore } from '../../store/useAuthStore';

interface SongActionSheetProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToPlaylist?: (song: Song) => void;
}

export const SongActionSheet: React.FC<SongActionSheetProps> = ({
  song,
  isOpen,
  onClose,
  onAddToPlaylist,
}) => {
  const navigate = useNavigate();
  const { playSong, toggleFavoriteStatus } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();

  if (!isOpen || !song) return null;

  const handlePlay = () => {
    playSong(song);
    onClose();
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return;
    try {
      if (song.isFavorite) {
        await favoriteService.removeFavorite(song.id);
      } else {
        await favoriteService.addFavorite(song.id);
      }
      toggleFavoriteStatus(song.id);
      onClose();
    } catch (_e) {
      // Ignore
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: song.title,
        text: `Listen to ${song.title} by ${song.artist?.name || 'Artist'} on MusicWave!`,
        url: window.location.origin + `/songs/${song.id}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + `/songs/${song.id}`);
      alert('Song link copied to clipboard!');
    }
    onClose();
  };

  const handleViewArtist = () => {
    if (song.artistId) {
      navigate(`/artists/${song.artistId}`);
    }
    onClose();
  };

  const handleViewAlbum = () => {
    if (song.albumId) {
      navigate(`/albums/${song.albumId}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#141220] border-t border-white/10 rounded-t-3xl p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-250 select-none"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
      >
        {/* Top Header info */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={song.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&q=80'}
              alt={song.title}
              className="w-12 h-12 rounded-xl object-cover border border-white/10"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">{song.title}</h4>
              <p className="text-xs text-gray-400 truncate">{song.artist?.name || 'Unknown Artist'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Menu List */}
        <div className="space-y-1">
          <button
            onClick={handlePlay}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors min-h-[48px]"
          >
            <Play className="w-5 h-5 text-purple-400 fill-purple-400/20" />
            <span>Play Song</span>
          </button>

          {onAddToPlaylist && (
            <button
              onClick={() => {
                onAddToPlaylist(song);
                onClose();
              }}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors min-h-[48px]"
            >
              <PlusCircle className="w-5 h-5 text-cyan-400" />
              <span>Add to Playlist</span>
            </button>
          )}

          <button
            onClick={handleFavorite}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors min-h-[48px]"
          >
            <Heart className={`w-5 h-5 ${song.isFavorite ? 'text-pink-500 fill-pink-500' : 'text-pink-400'}`} />
            <span>{song.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
          </button>

          {song.artistId && (
            <button
              onClick={handleViewArtist}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors min-h-[48px]"
            >
              <Mic2 className="w-5 h-5 text-amber-400" />
              <span>View Artist</span>
            </button>
          )}

          {song.albumId && (
            <button
              onClick={handleViewAlbum}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors min-h-[48px]"
            >
              <Disc className="w-5 h-5 text-indigo-400" />
              <span>View Album</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors min-h-[48px]"
          >
            <Share2 className="w-5 h-5 text-emerald-400" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
