import React, { useEffect, useState } from 'react';
import { Heart, Play, Shuffle } from 'lucide-react';
import { favoriteService } from '../services/favoriteService';
import { Song } from '../types';
import { SongListItem } from '../components/common/SongListItem';
import { SkeletonRow } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { playSong, toggleShuffle } = usePlayerStore();

  const [favorites, setFavorites] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await favoriteService.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated]);

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      playSong(favorites[0], favorites);
    }
  };

  const handleShufflePlay = () => {
    if (favorites.length > 0) {
      toggleShuffle();
      const randomIndex = Math.floor(Math.random() * favorites.length);
      playSong(favorites[randomIndex], favorites);
    }
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view Favorites"
        description="Save your favorite tracks to listen anytime."
        actionText="Sign In"
        onAction={() => navigate('/login')}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-6 border-b border-white/10 pb-8">
        <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-gradient-to-br from-pink-500 via-purple-600 to-rose-600 flex items-center justify-center text-white shadow-pink-glow flex-shrink-0">
          <Heart className="w-20 h-20 fill-current" />
        </div>
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-400">Playlist</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">Favorite Songs</h1>
          <p className="text-xs text-gray-400">
            {favorites.length} {favorites.length === 1 ? 'song' : 'songs'} saved in your library
          </p>

          {favorites.length > 0 && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePlayAll}
                className="px-6 py-3 rounded-full bg-gradient-primary hover:bg-gradient-hover text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play All</span>
              </button>
              <button
                onClick={handleShufflePlay}
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-2 transition-all"
              >
                <Shuffle className="w-4 h-4" />
                <span>Shuffle</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Favorites List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : favorites.length === 0 ? (
          <EmptyState
            title="No favorite songs yet"
            description="Click the heart icon on any song to add it to your favorites."
            actionText="Discover Music"
            onAction={() => navigate('/')}
          />
        ) : (
          favorites.map((song, index) => (
            <SongListItem
              key={song.id}
              song={{ ...song, isFavorite: true }}
              index={index}
              playlistContext={favorites}
            />
          ))
        )}
      </div>
    </div>
  );
};
