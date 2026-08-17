import { create } from 'zustand';
import { Song, RepeatMode } from '../types';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  volume: number; // 0 to 1
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isLyricsOpen: boolean;
  isQueueOpen: boolean;

  // Actions
  playSong: (song: Song, queueList?: Song[]) => void;
  togglePlay: () => void;
  setPlaying: (isPlaying: boolean) => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setLyricsOpen: (isOpen: boolean) => void;
  setQueueOpen: (isOpen: boolean) => void;
  toggleFavoriteStatus: (songId: string) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  currentIndex: -1,
  volume: 0.8,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  isShuffle: false,
  repeatMode: 'off',
  isLyricsOpen: false,
  isQueueOpen: false,

  playSong: (song, queueList) => {
    let newQueue = queueList && queueList.length > 0 ? [...queueList] : get().queue;
    
    // If song isn't in queue, append it
    let idx = newQueue.findIndex((s) => s.id === song.id);
    if (idx === -1) {
      newQueue = [song, ...newQueue];
      idx = 0;
    }

    set({
      currentSong: song,
      isPlaying: true,
      queue: newQueue,
      currentIndex: idx,
      currentTime: 0,
    });
  },

  togglePlay: () => {
    const { currentSong, isPlaying } = get();
    if (!currentSong) return;
    set({ isPlaying: !isPlaying });
  },

  setPlaying: (isPlaying) => set({ isPlaying }),

  nextSong: () => {
    const { queue, currentIndex, isShuffle, repeatMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      set({ currentTime: 0, isPlaying: true });
      return;
    }

    let nextIdx = currentIndex + 1;

    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }

    set({
      currentIndex: nextIdx,
      currentSong: queue[nextIdx] || null,
      isPlaying: true,
      currentTime: 0,
    });
  },

  prevSong: () => {
    const { queue, currentIndex, currentTime } = get();
    if (queue.length === 0) return;

    // If current song played for > 3 seconds, restart it
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }

    set({
      currentIndex: prevIdx,
      currentSong: queue[prevIdx] || null,
      isPlaying: true,
      currentTime: 0,
    });
  },

  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),

  toggleMute: () => {
    const { isMuted } = get();
    set({ isMuted: !isMuted });
  },

  setCurrentTime: (currentTime) => set({ currentTime }),

  setDuration: (duration) => set({ duration }),

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

  toggleRepeat: () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const current = get().repeatMode;
    const nextIndex = (modes.indexOf(current) + 1) % modes.length;
    set({ repeatMode: modes[nextIndex] });
  },

  addToQueue: (song) => {
    const { queue } = get();
    if (queue.some((s) => s.id === song.id)) return;
    set({ queue: [...queue, song] });
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    let newCurrentIdx = currentIndex;

    if (index < currentIndex) {
      newCurrentIdx = currentIndex - 1;
    }

    set({
      queue: newQueue,
      currentIndex: newCurrentIdx,
      currentSong: newQueue[newCurrentIdx] || null,
    });
  },

  clearQueue: () => set({ queue: [], currentSong: null, isPlaying: false, currentIndex: -1 }),

  setLyricsOpen: (isLyricsOpen) => set({ isLyricsOpen }),

  setQueueOpen: (isQueueOpen) => set({ isQueueOpen }),

  toggleFavoriteStatus: (songId) => {
    const updateSongFavorite = (s: Song | null) => {
      if (!s || s.id !== songId) return s;
      return { ...s, isFavorite: !s.isFavorite };
    };

    set((state) => ({
      currentSong: updateSongFavorite(state.currentSong),
      queue: state.queue.map((s) => (s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s)),
    }));
  },
}));
