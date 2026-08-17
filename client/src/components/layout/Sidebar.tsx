import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Compass,
  Search,
  Library,
  Heart,
  History,
  Mic2,
  Disc,
  ListMusic,
  ShieldCheck,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { usePlayerStore } from '../../store/usePlayerStore';

interface SidebarProps {
  onOpenCreatePlaylist?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreatePlaylist }) => {
  const { user } = useAuthStore();
  const { currentSong } = usePlayerStore();

  const mainNav = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Explore', icon: Compass, path: '/explore' },
    { name: 'Search', icon: Search, path: '/search' },
  ];

  const libraryNav = [
    { name: 'Library', icon: Library, path: '/library' },
    { name: 'Favorites', icon: Heart, path: '/favorites' },
    { name: 'Recently Played', icon: History, path: '/history' },
    { name: 'Artists', icon: Mic2, path: '/explore?tab=artists' },
    { name: 'Albums', icon: Disc, path: '/explore?tab=albums' },
  ];

  return (
    <aside className={`hidden md:flex w-64 h-full bg-[#0d0b14]/90 backdrop-blur-xl border-r border-white/5 flex-col justify-between select-none z-30 transition-all ${currentSong ? 'pb-24' : 'pb-6'}`}>
      <div className="p-6">
        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center gap-3 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-wider text-white">
              Music<span className="text-gradient">Wave</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Stream Modern Sound</p>
          </div>
        </NavLink>

        {/* Main Navigation */}
        <div className="space-y-6">
          <div>
            <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
              Menu
            </h2>
            <nav className="space-y-1">
              {mainNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-glow'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Library Section */}
          <div>
            <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
              My Music
            </h2>
            <nav className="space-y-1">
              {libraryNav.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-glow'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Quick Upload Song & Create Playlist */}
          <div className="pt-2 space-y-2">
            <NavLink
              to="/admin/songs"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-primary hover:opacity-90 shadow-glow transition-all group`
              }
            >
              <PlusCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>Upload / Add Song</span>
            </NavLink>

            <button
              onClick={onOpenCreatePlaylist}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
            >
              <ListMusic className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Create Playlist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Link if Admin */}
      {user?.role === 'ADMIN' && (
        <div className="px-6 pt-2">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
                isActive
                  ? 'bg-pink-600/20 text-pink-400 border-pink-500/30 shadow-pink-glow'
                  : 'text-pink-400/80 bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20 hover:text-pink-300'
              }`
            }
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </NavLink>
        </div>
      )}
    </aside>
  );
};
