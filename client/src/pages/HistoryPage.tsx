import React, { useEffect, useState } from 'react';
import { History, Trash2, Play } from 'lucide-react';
import { historyService } from '../services/historyService';
import { RecentlyPlayed } from '../types';
import { SongListItem } from '../components/common/SongListItem';
import { SkeletonRow } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { useNavigate } from 'react-router-dom';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { playSong } = usePlayerStore();

  const [history, setHistory] = useState<RecentlyPlayed[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await historyService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isAuthenticated]);

  const handleClearHistory = async () => {
    try {
      await historyService.clearHistory();
      setHistory([]);
    } catch (_e) {
      // Ignore
    }
  };

  const songList = history.map((item) => item.song);

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view History"
        description="Track your recent listening history across all devices."
        actionText="Sign In"
        onAction={() => navigate('/login')}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Recently Played</h1>
            <p className="text-xs text-gray-400">Your recent music stream activity</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-xs font-semibold border border-white/10 text-gray-300 flex items-center gap-2 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History Track List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : history.length === 0 ? (
          <EmptyState
            title="No listening history yet"
            description="Start listening to songs and your stream history will appear here."
            actionText="Start Listening"
            onAction={() => navigate('/')}
          />
        ) : (
          history.map((item, index) => (
            <SongListItem
              key={`${item.id}-${index}`}
              song={item.song}
              index={index}
              playlistContext={songList}
            />
          ))
        )}
      </div>
    </div>
  );
};
