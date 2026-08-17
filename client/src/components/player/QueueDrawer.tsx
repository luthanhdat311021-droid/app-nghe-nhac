import React from 'react';
import { X, Trash2, Play, Music } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

export const QueueDrawer: React.FC = () => {
  const {
    queue,
    currentIndex,
    currentSong,
    isQueueOpen,
    setQueueOpen,
    playSong,
    removeFromQueue,
    clearQueue,
  } = usePlayerStore();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed right-0 top-20 bottom-24 w-80 md:w-96 bg-[#120f20]/95 backdrop-blur-2xl border-l border-white/10 z-30 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-white">Playback Queue</h3>
          <p className="text-xs text-gray-400 mt-0.5">{queue.length} Songs in queue</p>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-all text-xs flex items-center gap-1"
              title="Clear Queue"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={() => setQueueOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {queue.length > 0 ? (
          queue.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;

            return (
              <div
                key={`${song.id}-${index}`}
                className={`group flex items-center gap-3 p-2.5 rounded-2xl transition-all border ${
                  isCurrent
                    ? 'bg-purple-600/20 border-purple-500/40 text-purple-300 shadow-glow'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <div className="relative flex-shrink-0 cursor-pointer" onClick={() => playSong(song, queue)}>
                  <img
                    src={song.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&q=80'}
                    alt={song.title}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => playSong(song, queue)}>
                  <p className={`text-xs font-bold truncate ${isCurrent ? 'text-purple-300' : 'text-white'}`}>
                    {song.title}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{song.artist?.name}</p>
                </div>

                <button
                  onClick={() => removeFromQueue(index)}
                  className="p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
            <Music className="w-10 h-10 text-gray-600" />
            <p className="text-sm font-semibold text-gray-300">Your queue is empty</p>
            <p className="text-xs text-gray-500">Play a song or playlist to add tracks here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
