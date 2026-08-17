import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { songService } from '../services/songService';
import { historyService } from '../services/historyService';
import { useAuthStore } from '../store/useAuthStore';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    togglePlay,
    nextSong,
    prevSong,
    setCurrentTime,
    setDuration,
    setPlaying,
    setVolume,
  } = usePlayerStore();

  const { isAuthenticated } = useAuthStore();

  // Initialize HTMLAudioElement instance once
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      nextSong();
    };

    const handleError = (e: ErrorEvent) => {
      console.warn('Audio playback error:', e);
      setPlaying(false);
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
  }, [setCurrentTime, setDuration, nextSong, setPlaying]);

  // Handle currentSong change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong && currentSong.audioUrl) {
      if (audio.src !== currentSong.audioUrl) {
        audio.src = currentSong.audioUrl;
        audio.currentTime = 0;
        
        if (isPlaying) {
          audio.play().catch((err) => {
            console.warn('Auto-play blocked or failed:', err);
            setPlaying(false);
          });
        }

        // Record listening history & play count in background
        songService.recordPlay(currentSong.id).catch(() => {});
        if (isAuthenticated) {
          historyService.recordHistory(currentSong.id).catch(() => {});
        }
      }
    } else {
      audio.pause();
      audio.src = '';
    }
  }, [currentSong]);

  // Handle play/pause state change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  // Handle volume & mute change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Seek function
  const seek = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seek(Math.min(currentTime + 5, audioRef.current?.duration || 0));
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
  }, [currentTime, volume, togglePlay, setVolume]);

  return {
    seek,
  };
}
