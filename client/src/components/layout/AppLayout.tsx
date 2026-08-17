import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { BottomPlayer } from '../player/BottomPlayer';
import { LyricsModal } from '../player/LyricsModal';
import { QueueDrawer } from '../player/QueueDrawer';
import { CreatePlaylistModal } from '../common/CreatePlaylistModal';
import { usePlayerStore } from '../../store/usePlayerStore';

export const AppLayout: React.FC = () => {
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const { currentSong } = usePlayerStore();

  return (
    <div className="min-h-screen bg-[#09080e] text-white flex flex-col font-sans overflow-x-hidden selection:bg-purple-500 selection:text-white">
      <div className="flex flex-1 min-h-0 relative">
        {/* Left Sidebar */}
        <Sidebar onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className={`flex-1 p-4 md:p-8 overflow-y-auto ${currentSong ? 'pb-40 md:pb-32' : 'pb-24 md:pb-12'}`}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Persistent Bottom Player */}
      <BottomPlayer />

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* Lyrics Modal */}
      <LyricsModal />

      {/* Queue Drawer */}
      <QueueDrawer />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />
    </div>
  );
};
