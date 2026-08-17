import React from 'react';
import { Edit, Trash2, Youtube, Disc, Mic2, Clock, Play } from 'lucide-react';
import { Song } from '../../../types';

interface AdminSongCardProps {
  song: Song;
  onEdit: (song: Song) => void;
  onDelete: (id: string) => void;
}

export const AdminSongCard: React.FC<AdminSongCardProps> = ({
  song,
  onEdit,
  onDelete,
}) => {
  const src = song.sourceType || (song.youtubeVideoId ? 'YOUTUBE' : 'DIRECT_URL');

  const formatDuration = (seconds: number) => {
    if (!seconds) return '03:30';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3 select-none">
      <div className="flex items-start gap-3">
        <img
          src={song.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&q=80'}
          alt={song.title}
          className="w-14 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white truncate">{song.title}</h4>
            {src === 'YOUTUBE' ? (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center gap-1 flex-shrink-0">
                <Youtube className="w-3 h-3 fill-current" />
                YT
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold flex-shrink-0">
                MP3
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
            <Mic2 className="w-3 h-3 text-purple-400" />
            <span>{song.artist?.name || 'Unknown Artist'}</span>
          </p>
          {song.album && (
            <p className="text-[11px] text-gray-500 truncate mt-0.5 flex items-center gap-1">
              <Disc className="w-3 h-3 text-indigo-400" />
              <span>{song.album.title}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-gray-400">
        <div className="flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span>{formatDuration(song.duration)}</span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-purple-400">
          <Play className="w-3 h-3" />
          <span>{song.playCount || 0} plays</span>
        </div>
      </div>

      {/* Action Touch Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onEdit(song)}
          className="flex-1 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[44px]"
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(song.id)}
          className="py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all min-h-[44px]"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
