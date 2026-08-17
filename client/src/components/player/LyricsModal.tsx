import React from 'react';
import { X, Music2 } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

export const LyricsModal: React.FC = () => {
  const { currentSong, isLyricsOpen, setLyricsOpen, currentTime } = usePlayerStore();

  if (!isLyricsOpen || !currentSong) return null;

  // Parse timed lyrics format e.g. [00:15.00] Line text
  const parseLyrics = (text: string | null | undefined) => {
    if (!text) return [];
    const lines = text.split('\n');
    return lines.map((line) => {
      const match = line.match(/\[(\d+):(\d+\.\d+)\]\s*(.*)/);
      if (match) {
        const mins = parseInt(match[1], 10);
        const secs = parseFloat(match[2]);
        const timeInSecs = mins * 60 + secs;
        return { time: timeInSecs, text: match[3] || '...' };
      }
      return { time: null, text: line };
    });
  };

  const parsedLines = parseLyrics(currentSong.lyrics);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#141122]/90 border border-white/10 rounded-3xl p-8 shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header Close */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={currentSong.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80'}
              alt={currentSong.title}
              className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-white/10"
            />
            <div>
              <h3 className="text-lg font-bold text-white">{currentSong.title}</h3>
              <p className="text-xs text-purple-400 font-medium">{currentSong.artist?.name}</p>
            </div>
          </div>
          <button
            onClick={() => setLyricsOpen(false)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lyrics Content Container */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 scroll-smooth">
          {parsedLines.length > 0 ? (
            parsedLines.map((lineObj, idx) => {
              const isCurrent =
                lineObj.time !== null &&
                currentTime >= lineObj.time &&
                (idx === parsedLines.length - 1 ||
                  parsedLines[idx + 1].time === null ||
                  currentTime < (parsedLines[idx + 1].time as number));

              return (
                <p
                  key={idx}
                  className={`text-center font-bold text-lg md:text-2xl transition-all duration-300 ${
                    isCurrent
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 scale-105 shadow-glow'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {lineObj.text}
                </p>
              );
            })
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
              <Music2 className="w-12 h-12 text-gray-600 animate-pulse" />
              <p className="text-base font-semibold text-gray-300">Lyrics aren't available for this song.</p>
              <p className="text-xs text-gray-500">Enjoy the rhythm and instrumental melody!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
