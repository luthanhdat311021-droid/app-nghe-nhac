import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { Artist } from '../../types';

interface ArtistCardProps {
  artist: Artist;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <Link
      to={`/artists/${artist.id}`}
      className="glass-card p-4 rounded-3xl group flex flex-col items-center text-center select-none cursor-pointer"
    >
      <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:border-purple-500/50 shadow-xl transition-all">
        <img
          src={artist.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div className="flex items-center gap-1.5 justify-center mb-0.5">
        <h4 className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors truncate max-w-[140px]">
          {artist.name}
        </h4>
        {artist.verified && <BadgeCheck className="w-4 h-4 text-purple-400 fill-purple-400/20 flex-shrink-0" />}
      </div>

      <p className="text-xs text-gray-400 font-medium">Artist</p>
    </Link>
  );
};
