import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Heart, Disc, FileText } from 'lucide-react';
import { songService } from '../services/songService';
import { favoriteService } from '../services/favoriteService';
import { Song } from '../types';
import { SongCard } from '../components/common/SongCard';
import { SkeletonRow } from '../components/common/Skeleton';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';

export const SongDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentSong, isPlaying, playSong, togglePlay, toggleFavoriteStatus } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();

  const [song, setSong] = useState<Song | null>(null);
  const [recommended, setRecommended] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchSong = async () => {
      setLoading(true);
      try {
        const data = await songService.getSongById(id);
        setSong(data);
        const recs = await songService.getRecommendedSongs();
        setRecommended(recs.slice(0, 6));
      } catch (err) {
        console.error('Failed to load song details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  if (loading || !song) {
    return <SkeletonRow />;
  }

  const isCurrent = currentSong?.id === song.id;

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, [song, ...recommended]);
    }
  };

  const handleLikeClick = async () => {
    if (!isAuthenticated) return;
    try {
      if (song.isFavorite) {
        await favoriteService.removeFavorite(song.id);
      } else {
        await favoriteService.addFavorite(song.id);
      }
      toggleFavoriteStatus(song.id);
      setSong((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    } catch (_e) {
      // Ignore
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-8 border-b border-white/10 pb-8">
        <img
          src={song.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80'}
          alt={song.title}
          className="w-48 h-48 md:w-64 md:h-64 rounded-3xl object-cover shadow-2xl border border-white/10 flex-shrink-0"
        />
        <div className="space-y-4 flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Single Track</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">{song.title}</h1>

          <div className="flex items-center gap-3 text-xs text-gray-300">
            {song.artist && (
              <Link to={`/artists/${song.artist.id}`} className="font-bold text-purple-400 hover:underline">
                {song.artist.name}
              </Link>
            )}
            {song.album && (
              <>
                <span>•</span>
                <Link to={`/albums/${song.album.id}`} className="flex items-center gap-1 text-gray-400 hover:text-white">
                  <Disc className="w-3.5 h-3.5" />
                  <span>{song.album.title}</span>
                </Link>
              </>
            )}
            <span>•</span>
            <span>{song.playCount} Plays</span>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handlePlayClick}
              className="px-6 py-3 rounded-full bg-gradient-primary hover:bg-gradient-hover text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all hover:scale-105"
            >
              {isCurrent && isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isCurrent && isPlaying ? 'Pause Track' : 'Play Song'}</span>
            </button>

            <button
              onClick={handleLikeClick}
              className={`p-3 rounded-full border transition-all ${
                song.isFavorite
                  ? 'bg-pink-500/20 border-pink-500/40 text-pink-400'
                  : 'bg-white/10 border-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-pink-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Lyrics Section */}
      {song.lyrics && (
        <div className="glass-panel p-6 rounded-3xl space-y-3 max-w-2xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Lyrics</span>
          </h3>
          <pre className="text-sm font-sans text-gray-300 whitespace-pre-wrap leading-relaxed">
            {song.lyrics}
          </pre>
        </div>
      )}

      {/* Recommended tracks */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-white">Recommended Songs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recommended.map((item) => (
            <SongCard key={item.id} song={item} />
          ))}
        </div>
      </section>
    </div>
  );
};
