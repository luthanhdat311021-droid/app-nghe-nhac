import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { songService } from '../services/songService';
import { historyService } from '../services/historyService';
import { useAuthStore } from '../store/useAuthStore';
import { YouTubePlayerRef } from '../components/player/YouTubePlayer';

export function useAudioPlayer(ytPlayerRef?: React.RefObject<YouTubePlayerRef>) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    togglePlay,
    nextSong,
    setCurrentTime,
    setDuration,
    setPlaying,
    setVolume,
  } = usePlayerStore();

  const { isAuthenticated } = useAuthStore();

  const isYouTube = currentSong?.sourceType === 'YOUTUBE' && !!currentSong?.youtubeVideoId;

  // 1. Initialize HTML5 Audio instance once
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (!isYouTube) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (!isYouTube) {
        setDuration(audio.duration || 0);
      }
    };

    const handleEnded = () => {
      if (!isYouTube) {
        nextSong();
      }
    };

    const handleError = (e: ErrorEvent) => {
      if (!isYouTube) {
        console.warn('Audio playback error:', e);
        setPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as EventListener);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as EventListener);
    };
  }, [isYouTube, setCurrentTime, setDuration, nextSong, setPlaying]);

  // 2. Handle currentSong change & record history
  useEffect(() => {
    const audio = audioRef.current;

    if (currentSong) {
      // Record stream play count & history
      songService.recordPlay(currentSong.id).catch(() => {});
      if (isAuthenticated) {
        historyService.recordHistory(currentSong.id).catch(() => {});
      }

      if (!isYouTube && currentSong.audioUrl) {
        if (audio && audio.src !== currentSong.audioUrl) {
          audio.src = currentSong.audioUrl;
          audio.currentTime = 0;
          if (isPlaying) {
            audio.play().catch(() => setPlaying(false));
          }
        }
      } else if (isYouTube && audio) {
        // Pause HTML5 audio if switching to YouTube
        audio.pause();
        audio.src = '';
      }
    } else if (audio) {
      audio.pause();
      audio.src = '';
    }
  }, [currentSong?.id]);

  // 3. Handle Play / Pause for HTML5 Audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong || isYouTube) return;

    if (isPlaying) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong, isYouTube]);

  // 4. Handle Volume for HTML5 Audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Unified Seek Function
  const seek = (time: number) => {
    setCurrentTime(time);
    if (isYouTube && ytPlayerRef?.current) {
      ytPlayerRef.current.seekTo(time);
    } else if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seek(Math.min(currentTime + 5, duration || 0));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seek(Math.max(currentTime - 5, 0));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(Math.min(volume + 0.1, 1));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(Math.max(volume - 0.1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, volume, togglePlay, setVolume]);

  return {
    seek,
  };
}
