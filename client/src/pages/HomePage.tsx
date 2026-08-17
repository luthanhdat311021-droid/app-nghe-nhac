import React, { useEffect, useState } from 'react';
import { Play, Sparkles, Flame, TrendingUp, Radio, Compass } from 'lucide-react';
import { SongCard } from '../components/common/SongCard';
import { SongListItem } from '../components/common/SongListItem';
import { ArtistCard } from '../components/common/ArtistCard';
import { AlbumCard } from '../components/common/AlbumCard';
import { SkeletonCard, SkeletonRow } from '../components/common/Skeleton';
import { songService } from '../services/songService';
import { artistService } from '../services/artistService';
import { albumService } from '../services/albumService';
import { historyService } from '../services/historyService';
import { Song, Artist, Album, RecentlyPlayed } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { playSong } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();

  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [newReleases, setNewReleases] = useState<Song[]>([]);
  const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
  const [popularAlbums, setPopularAlbums] = useState<Album[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trending, recommended, releases, artists, albums] = await Promise.all([
          songService.getTrendingSongs(),
          songService.getRecommendedSongs(),
          songService.getNewReleases(),
          artistService.getPopularArtists(),
          albumService.getPopularAlbums(),
        ]);

        setTrendingSongs(trending);
        setRecommendedSongs(recommended);
        setNewReleases(releases);
        setPopularArtists(artists);
        setPopularAlbums(albums);

        if (isAuthenticated) {
          const history = await historyService.getHistory();
          setRecentlyPlayed(history.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleStartListening = () => {
    if (trendingSongs.length > 0) {
      playSong(trendingSongs[0], trendingSongs);
    }
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-300 pb-6">
      {/* Hero Banner Section */}
      <section className="relative rounded-3xl p-6 sm:p-8 md:p-12 overflow-hidden bg-gradient-to-r from-purple-900/60 via-purple-800/30 to-pink-900/40 border border-purple-500/20 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 md:w-96 h-72 md:h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Soundscapes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Discover your next <span className="text-gradient">favorite song.</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-300">
            Stream high fidelity audio, create custom playlists, and follow your favorite neon cyberpunk, lofi, and modern pop creators.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleStartListening}
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-gradient-primary hover:bg-gradient-hover text-white text-xs sm:text-sm font-bold shadow-glow active:scale-95 transition-all flex items-center gap-2 min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Listening</span>
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/10 backdrop-blur-md active:scale-95 transition-all flex items-center gap-2 min-h-[44px]"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Music</span>
            </button>
          </div>
        </div>
      </section>

      {/* Recently Played Section */}
      {recentlyPlayed.length > 0 && (
        <section className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-400" />
              <span>Recently Played</span>
            </h2>
          </div>
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-3.5 md:gap-4 overflow-x-auto scrollbar-none snap-x pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {recentlyPlayed.map((item) => (
              <div key={item.id} className="w-36 sm:w-44 md:w-auto flex-shrink-0 snap-start">
                <SongCard song={item.song} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      <section className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Trending Now</span>
          </h2>
        </div>
        <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-3.5 md:gap-4 overflow-x-auto scrollbar-none snap-x pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-36 sm:w-44 md:w-auto flex-shrink-0">
                  <SkeletonCard />
                </div>
              ))
            : trendingSongs.slice(0, 6).map((song) => (
                <div key={song.id} className="w-36 sm:w-44 md:w-auto flex-shrink-0 snap-start">
                  <SongCard song={song} playlistContext={trendingSongs} />
                </div>
              ))}
        </div>
      </section>

      {/* Recommended For You */}
      <section className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <span>Recommended For You</span>
          </h2>
        </div>
        <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-3.5 md:gap-4 overflow-x-auto scrollbar-none snap-x pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-36 sm:w-44 md:w-auto flex-shrink-0">
                  <SkeletonCard />
                </div>
              ))
            : recommendedSongs.slice(0, 6).map((song) => (
                <div key={song.id} className="w-36 sm:w-44 md:w-auto flex-shrink-0 snap-start">
                  <SongCard song={song} playlistContext={recommendedSongs} />
                </div>
              ))}
        </div>
      </section>

      {/* Top Charts Table */}
      <section className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Top Charts</span>
          </h2>
        </div>
        <div className="space-y-2">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : trendingSongs.slice(0, 5).map((song, index) => (
                <SongListItem
                  key={song.id}
                  song={song}
                  index={index}
                  playlistContext={trendingSongs}
                />
              ))}
        </div>
      </section>

      {/* Popular Artists */}
      <section className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">Popular Artists</h2>
        </div>
        <div className="flex md:grid md:grid-cols-5 lg:grid-cols-6 gap-3.5 md:gap-4 overflow-x-auto scrollbar-none snap-x pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {popularArtists.slice(0, 6).map((artist) => (
            <div key={artist.id} className="w-32 sm:w-40 md:w-auto flex-shrink-0 snap-start">
              <ArtistCard artist={artist} />
            </div>
          ))}
        </div>
      </section>

      {/* Popular Albums */}
      <section className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">Popular Albums</h2>
        </div>
        <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-3.5 md:gap-4 overflow-x-auto scrollbar-none snap-x pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {popularAlbums.slice(0, 6).map((album) => (
            <div key={album.id} className="w-36 sm:w-44 md:w-auto flex-shrink-0 snap-start">
              <AlbumCard album={album} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
