import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Search', icon: Search, path: '/search' },
    { name: 'Library', icon: Library, path: '/library' },
    { name: 'Favorites', icon: Heart, path: '/favorites' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0c0a14]/95 backdrop-blur-2xl border-t border-white/10 z-50 px-2 flex items-center justify-around shadow-2xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 min-w-[56px] min-h-[44px] ${
              isActive
                ? 'text-purple-400 font-semibold'
                : 'text-gray-400 hover:text-gray-200 font-normal'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <item.icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 fill-purple-500/20' : ''
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-glow" />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-purple-300' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
