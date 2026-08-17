import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  FileText,
  ListMusic,
  Volume2,
  VolumeX,
  Share2,
  MoreVertical,
  Youtube,
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { favoriteService } from '../../services/favoriteService';
import { useAuthStore } from '../../store/useAuthStore';

interface FullScreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  onSeek: (seconds: number) => void;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  isOpen,
  onClose,
  onSeek,
}) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    volume,
    isMuted,
    isLyricsOpen,
    isQueueOpen,
    togglePlay,
    nextSong,
    prevSong,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    toggleMute,
    setLyricsOpen,
    setQueueOpen,
    toggleFavoriteStatus,
  } = usePlayerStore();

  const { isAuthenticated } = useAuthStore();
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  if (!isOpen || !currentSong) return null;

  const isYouTube = currentSong.sourceType === 'YOUTUBE' && !!currentSong.youtubeVideoId;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFavoriteClick = async () => {
    if (!currentSong || !isAuthenticated) return;
    try {
      if (currentSong.isFavorite) {
        await favoriteService.removeFavorite(currentSong.id);
      } else {
        await favoriteService.addFavorite(currentSong.id);
      }
      toggleFavoriteStatus(currentSong.id);
    } catch (_e) {
      // Ignore
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY !== null) {
      const deltaY = e.touches[0].clientY - touchStartY;
      if (deltaY > 120) {
        onClose();
        setTouchStartY(null);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentSong.title,
        text: `Listening to ${currentSong.title} by ${currentSong.artist?.name || 'Artist'} on MusicWave!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#090710]/98 backdrop-blur-3xl z-50 flex flex-col justify-between p-6 md:hidden animate-in slide-in-from-bottom duration-300 select-none overflow-y-auto"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-3 text-gray-400 hover:text-white rounded-full bg-white/5 active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold tracking-widest text-purple-400">Playing From</p>
          <p className="text-xs font-semibold text-white/90 truncate max-w-[180px]">
            {currentSong.album?.title || 'MusicWave Library'}
          </p>
        </div>
        <button
          onClick={handleShare}
          className="p-3 text-gray-400 hover:text-white rounded-full bg-white/5 active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Share song"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Album Cover */}
      <div className="my-auto py-6 flex flex-col items-center">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
          <img
            src={currentSong.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80'}
            alt={currentSong.title}
            className="w-full h-full object-cover"
          />
          {isYouTube && (
            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-red-600/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
              <Youtube className="w-4 h-4 fill-current" />
              <span>YouTube</span>
            </div>
          )}
        </div>

        {/* Title, Artist & Favorite */}
        <div className="w-full mt-8 flex items-center justify-between px-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate">
              {currentSong.title}
            </h2>
            <p className="text-sm font-medium text-gray-400 truncate mt-1">
              {currentSong.artist?.name || 'Unknown Artist'}
            </p>
          </div>
          <button
            onClick={handleFavoriteClick}
            className="p-3 rounded-full active:scale-90 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Favorite song"
          >
            <Heart className={`w-6 h-6 ${currentSong.isFavorite ? 'text-pink-500 fill-pink-500' : 'text-gray-400'}`} />
          </button>
        </div>
      </div>

      {/* Controls & Progress Section */}
      <div className="w-full space-y-6">
        {/* Progress Seekbar */}
        <div className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Touch Playback Controls */}
        <div className="flex items-center justify-between px-4">
          <button
            onClick={toggleShuffle}
            className={`p-3 rounded-full active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
              isShuffle ? 'text-purple-400 bg-purple-500/20 shadow-glow' : 'text-gray-400'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={prevSong}
            className="p-3 text-white active:scale-90 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-glow active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
          </button>

          <button
            onClick={nextSong}
            className="p-3 text-white active:scale-90 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-3 rounded-full active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
              repeatMode !== 'off' ? 'text-purple-400 bg-purple-500/20 shadow-glow' : 'text-gray-400'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Bottom Utility Controls: Lyrics, Queue & Volume */}
        <div className="flex items-center justify-around pt-2 border-t border-white/5">
          <button
            onClick={() => {
              setLyricsOpen(!isLyricsOpen);
              onClose();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all min-h-[44px] ${
              isLyricsOpen ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'text-gray-400 bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => {
              setQueueOpen(!isQueueOpen);
              onClose();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all min-h-[44px] ${
              isQueueOpen ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'text-gray-400 bg-white/5'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            <span>Queue</span>
          </button>

          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-full min-h-[44px]">
            <button onClick={toggleMute} className="text-gray-400">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
