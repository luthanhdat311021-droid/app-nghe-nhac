import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  FileText,
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { favoriteService } from '../../services/favoriteService';
import { useAuthStore } from '../../store/useAuthStore';

export const BottomPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    isLyricsOpen,
    isQueueOpen,
    togglePlay,
    nextSong,
    prevSong,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setLyricsOpen,
    setQueueOpen,
    toggleFavoriteStatus,
  } = usePlayerStore();

  const { seek } = useAudioPlayer();
  const { isAuthenticated } = useAuthStore();

  if (!currentSong) return null;

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

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#0e0c18]/95 backdrop-blur-2xl border-t border-white/10 z-40 px-6 flex items-center justify-between shadow-2xl transition-all">
      {/* 1. Left: Track Info & Favorite */}
      <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
        <img
          src={currentSong.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80'}
          alt={currentSong.title}
          className="w-14 h-14 rounded-xl object-cover shadow-lg border border-white/10 flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white truncate hover:underline cursor-pointer">
            {currentSong.title}
          </h4>
          <p className="text-xs text-gray-400 truncate hover:text-gray-300 cursor-pointer mt-0.5">
            {currentSong.artist?.name || 'Unknown Artist'}
          </p>
        </div>
        <button
          onClick={handleFavoriteClick}
          className={`p-2 rounded-full transition-transform active:scale-95 ${
            currentSong.isFavorite ? 'text-pink-500 hover:text-pink-400' : 'text-gray-400 hover:text-white'
          }`}
          aria-label="Favorite song"
        >
          <Heart className={`w-5 h-5 ${currentSong.isFavorite ? 'fill-pink-500' : ''}`} />
        </button>
      </div>

      {/* 2. Middle: Audio Player Controls & Seekbar */}
      <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
        <div className="flex items-center gap-6">
          {/* Shuffle Toggle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full text-xs transition-colors ${
              isShuffle ? 'text-purple-400 bg-purple-500/20' : 'text-gray-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous Track */}
          <button
            onClick={prevSong}
            className="p-2 text-gray-300 hover:text-white transition-colors active:scale-90"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause Main Button */}
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-gradient-primary hover:bg-gradient-hover text-white flex items-center justify-center shadow-glow hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={nextSong}
            className="p-2 text-gray-300 hover:text-white transition-colors active:scale-90"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat Toggle */}
          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full text-xs transition-colors ${
              repeatMode !== 'off' ? 'text-purple-400 bg-purple-500/20' : 'text-gray-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress Bar & Timestamps */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-[11px] font-medium text-gray-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
            />
          </div>
          <span className="text-[11px] font-medium text-gray-400 w-10 text-left">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. Right: Lyrics, Queue & Volume */}
      <div className="flex items-center justify-end gap-4 w-1/4 min-w-[200px]">
        {/* Synced Lyrics Toggle */}
        <button
          onClick={() => setLyricsOpen(!isLyricsOpen)}
          className={`p-2 rounded-xl transition-all ${
            isLyricsOpen ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-glow' : 'text-gray-400 hover:text-white'
          }`}
          title="Lyrics"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Queue Drawer Toggle */}
        <button
          onClick={() => setQueueOpen(!isQueueOpen)}
          className={`p-2 rounded-xl transition-all ${
            isQueueOpen ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-glow' : 'text-gray-400 hover:text-white'
          }`}
          title="Play Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
