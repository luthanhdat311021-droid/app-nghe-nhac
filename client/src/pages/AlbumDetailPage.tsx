import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Disc, Calendar } from 'lucide-react';
import { albumService } from '../services/albumService';
import { Album } from '../types';
import { SongListItem } from '../components/common/SongListItem';
import { SkeletonRow } from '../components/common/Skeleton';
import { usePlayerStore } from '../store/usePlayerStore';

export const AlbumDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { playSong } = usePlayerStore();

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchAlbum = async () => {
      setLoading(true);
      try {
        const data = await albumService.getAlbumById(id);
        setAlbum(data);
      } catch (err) {
        console.error('Failed to load album:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  const handlePlayAlbum = () => {
    if (album?.songs && album.songs.length > 0) {
      playSong(album.songs[0], album.songs);
    }
  };

  if (loading || !album) {
    return <SkeletonRow />;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-8 border-b border-white/10 pb-8">
        <img
          src={album.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'}
          alt={album.title}
          className="w-44 h-44 md:w-56 md:h-56 rounded-3xl object-cover shadow-2xl border border-white/10 flex-shrink-0"
        />
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
            <Disc className="w-4 h-4" />
            <span>Album</span>
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">{album.title}</h1>

          <div className="flex items-center gap-2 text-xs text-gray-300">
            {album.artist && (
              <Link to={`/artists/${album.artist.id}`} className="font-bold text-purple-400 hover:underline">
                {album.artist.name}
              </Link>
            )}
            <span>•</span>
            {album.releaseDate && (
              <span className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{album.releaseDate}</span>
              </span>
            )}
            <span>•</span>
            <span>{album.songs?.length || 0} Tracks</span>
          </div>

          <div className="pt-2">
            <button
              onClick={handlePlayAlbum}
              className="px-6 py-3 rounded-full bg-gradient-primary hover:bg-gradient-hover text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Album</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-white mb-4">Tracklist</h2>
        {album.songs?.map((song, index) => (
          <SongListItem
            key={song.id}
            song={song}
            index={index}
            playlistContext={album.songs}
          />
        ))}
      </div>
    </div>
  );
};
