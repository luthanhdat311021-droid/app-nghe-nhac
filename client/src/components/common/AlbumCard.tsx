import React from 'react';
import { Link } from 'react-router-dom';
import { Disc } from 'lucide-react';
import { Album } from '../../types';

interface AlbumCardProps {
  album: Album;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  return (
    <Link
      to={`/albums/${album.id}`}
      className="glass-card p-3.5 rounded-2xl group flex flex-col justify-between select-none cursor-pointer"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3">
        <img
          src={album.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80'}
          alt={album.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-gray-300">
          <Disc className="w-4 h-4" />
        </div>
      </div>

      <div className="min-w-0">
        <h4 className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors truncate">
          {album.title}
        </h4>
        <p className="text-xs text-gray-400 truncate mt-0.5">{album.artist?.name || 'Artist'}</p>
      </div>
    </Link>
  );
};
