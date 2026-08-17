import React, { useEffect, useState } from 'react';
import { Users, Music, Mic2, Disc, ListMusic, Play, ShieldAlert } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminStats, Song } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <EmptyState
        title="Access Denied"
        description="You need Administrator permissions to access the Admin Panel."
        actionText="Back to Home"
        onAction={() => navigate('/')}
      />
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-400', link: '/admin/users' },
    { label: 'Total Songs', value: stats?.totalSongs || 0, icon: Music, color: 'text-pink-400', link: '/admin/songs' },
    { label: 'Total Artists', value: stats?.totalArtists || 0, icon: Mic2, color: 'text-cyan-400', link: '/admin/artists' },
    { label: 'Total Albums', value: stats?.totalAlbums || 0, icon: Disc, color: 'text-amber-400', link: '/admin/albums' },
    { label: 'Playlists', value: stats?.totalPlaylists || 0, icon: ListMusic, color: 'text-emerald-400', link: '#' },
    { label: 'Total Streams', value: stats?.totalPlays || 0, icon: Play, color: 'text-rose-400', link: '#' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">MusicWave System Management & Performance Overview</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="glass-card p-4 rounded-2xl flex flex-col justify-between group hover:border-purple-500/40"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">{card.label}</span>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <h3 className="text-2xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
              {loading ? '...' : card.value.toLocaleString()}
            </h3>
          </Link>
        ))}
      </div>

      {/* Admin Quick Management Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          to="/admin/songs"
          className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all group"
        >
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit mb-3 group-hover:scale-110 transition-transform">
            <Music className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-purple-300">Manage Songs</h3>
          <p className="text-xs text-gray-400 mt-1">Add, edit, upload audio, and manage song lyrics.</p>
        </Link>

        <Link
          to="/admin/artists"
          className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-pink-500/40 transition-all group"
        >
          <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-400 w-fit mb-3 group-hover:scale-110 transition-transform">
            <Mic2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-pink-300">Manage Artists</h3>
          <p className="text-xs text-gray-400 mt-1">Add artist profiles, bio, and verified badges.</p>
        </Link>

        <Link
          to="/admin/albums"
          className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-cyan-500/40 transition-all group"
        >
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 w-fit mb-3 group-hover:scale-110 transition-transform">
            <Disc className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300">Manage Albums</h3>
          <p className="text-xs text-gray-400 mt-1">Create studio albums, assign artists, and upload covers.</p>
        </Link>

        <Link
          to="/admin/users"
          className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-amber-500/40 transition-all group"
        >
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 w-fit mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-amber-300">Manage Users</h3>
          <p className="text-xs text-gray-400 mt-1">Lock accounts, change user roles, and manage permissions.</p>
        </Link>
      </div>

      {/* Top Streams Table */}
      {stats?.topSongs && stats.topSongs.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white">Top Streamed Songs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 border-b border-white/10 uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Artist</th>
                  <th className="pb-3">Play Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.topSongs.map((song: Song) => (
                  <tr key={song.id} className="hover:bg-white/5">
                    <td className="py-3 font-bold text-white">{song.title}</td>
                    <td className="py-3 text-purple-400">{song.artist?.name}</td>
                    <td className="py-3 text-gray-300">{song.playCount.toLocaleString()} plays</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
