import React from 'react';
import { Link } from 'react-router-dom';
import { ListMusic, Play } from 'lucide-react';
import { Playlist } from '../../types';

interface PlaylistCardProps {
  playlist: Playlist;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  const trackCount = playlist.songs?.length || 0;

  return (
    <Link
      to={`/playlists/${playlist.id}`}
      className="glass-card p-3.5 rounded-2xl group flex flex-col justify-between select-none cursor-pointer"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3">
        <img
          src={playlist.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80'}
          alt={playlist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <div className="w-12 h-12 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-glow">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-purple-300 flex items-center gap-1">
          <ListMusic className="w-3 h-3" />
          <span>{trackCount} tracks</span>
        </div>
      </div>

      <div className="min-w-0">
        <h4 className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors truncate">
          {playlist.name}
        </h4>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          By {playlist.user?.username || 'Curator'}
        </p>
      </div>
    </Link>
  );
};
