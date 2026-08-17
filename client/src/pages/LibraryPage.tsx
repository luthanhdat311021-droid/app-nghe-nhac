import React, { useEffect, useState } from 'react';
import { Library, Plus, Heart } from 'lucide-react';
import { playlistService } from '../services/playlistService';
import { Playlist } from '../types';
import { PlaylistCard } from '../components/common/PlaylistCard';
import { CreatePlaylistModal } from '../components/common/CreatePlaylistModal';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPlaylists = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await playlistService.getUserPlaylists();
      setPlaylists(data);
    } catch (err) {
      console.error('Failed to load user playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view your Library"
        description="Save playlists, liked songs, and custom collections to your account."
        actionText="Sign In"
        onAction={() => navigate('/login')}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">My Library</h1>
            <p className="text-xs text-gray-400">Manage your playlists and custom music collections.</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-primary hover:bg-gradient-hover text-white text-xs font-bold shadow-glow flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Quick Liked Songs Card */}
      <Link
        to="/favorites"
        className="glass-card p-6 rounded-3xl flex items-center justify-between group hover:border-pink-500/40"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-pink-glow">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors">
              Liked Songs
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Your collection of favorite tracks</p>
          </div>
        </div>
      </Link>

      {/* Playlists Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-white">Your Playlists</h2>

        {!loading && playlists.length === 0 ? (
          <EmptyState
            title="No playlists created yet"
            description="Create your first playlist and start adding your favorite music."
            actionText="Create Playlist"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {playlists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPlaylists}
      />
    </div>
  );
};
