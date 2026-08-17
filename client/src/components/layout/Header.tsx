import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, User as UserIcon, LogOut, Shield, Heart, Library, PlusCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="px-4 md:px-8 py-3 md:py-0 md:h-20 glass-nav sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
      {/* Mobile Top Row: Logo & User Actions */}
      <div className="flex md:hidden items-center justify-between w-full">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <span className="font-extrabold text-white text-xs">MW</span>
          </div>
          <span className="font-extrabold text-lg tracking-wider text-white">
            Music<span className="text-gradient">Wave</span>
          </span>
        </Link>

        {/* Mobile Right Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 relative min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-pink-500 absolute top-2 right-2 ring-2 ring-[#0d0b14]" />
            </button>
          )}

          {isAuthenticated && user ? (
            <Link to="/profile" className="p-0.5 rounded-full ring-2 ring-purple-500/30">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-primary text-white shadow-glow"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Real-time Search Input (Full width on mobile, max-md on desktop) */}
      <form onSubmit={handleSearchSubmit} className="relative w-full md:flex-1 md:max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (window.innerWidth < 768 && !searchQuery) {
              navigate('/search');
            }
          }}
          placeholder="Search songs, artists, playlists..."
          className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs md:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all min-h-[44px]"
        />
      </form>

      {/* Right User Actions (Desktop) */}
      <div className="hidden md:flex items-center gap-4" ref={menuRef}>
        {/* Quick Add Song Button */}
        <Link
          to="/admin/songs"
          className="px-3.5 py-2 rounded-full bg-gradient-primary text-white text-xs font-bold shadow-glow hover:opacity-90 transition-all flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Song</span>
        </Link>

        {/* Notification Bell */}
        {isAuthenticated && (
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-pink-500 absolute top-2 right-2 ring-4 ring-[#0d0b14]" />
            </button>

            {/* Notification Popup */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-[#161424] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Notifications</h4>
                  <span className="text-[10px] text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full">2 New</span>
                </div>
                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                    <p className="text-xs font-medium text-white">Welcome to MusicWave! 🎵</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Explore millions of high quality streaming tracks.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                    <p className="text-xs font-medium text-white">New Playlist Featured</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Check out Synthwave & Cyberpunk 2099 now.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile Menu */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/30"
              />
              <span className="text-sm font-semibold text-white max-w-[100px] truncate">{user.username}</span>
            </button>

            {/* Profile Dropdown */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#161424] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                <div className="px-4 py-2.5 border-b border-white/5">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <UserIcon className="w-4 h-4 text-purple-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span>Favorites</span>
                  </Link>
                  <Link
                    to="/library"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Library className="w-4 h-4 text-cyan-400" />
                    <span>My Library</span>
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-pink-400 hover:bg-pink-500/10 transition-all font-semibold"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>
                <div className="border-t border-white/5 pt-1">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-xs font-semibold text-gray-300 hover:text-white transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-gradient-primary hover:bg-gradient-hover text-white shadow-glow transition-all"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
