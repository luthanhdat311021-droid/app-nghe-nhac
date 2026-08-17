import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Music, Mic2, Disc, ListMusic } from 'lucide-react';
import { searchService } from '../services/searchService';
import { SearchResults } from '../types';
import { SongCard } from '../components/common/SongCard';
import { ArtistCard } from '../components/common/ArtistCard';
import { AlbumCard } from '../components/common/AlbumCard';
import { PlaylistCard } from '../components/common/PlaylistCard';
import { SkeletonCard } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<'all' | 'songs' | 'artists' | 'albums' | 'playlists'>('all');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery.trim()) {
      handleSearch(initialQuery.trim());
    } else {
      setResults(null);
    }
  }, [initialQuery]);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await searchService.search(searchTerm);
      setResults(res);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSearchParams({ q: val });
  };

  const hasResults =
    results &&
    (results.songs.length > 0 ||
      results.artists.length > 0 ||
      results.albums.length > 0 ||
      results.playlists.length > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Search Header Input */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search songs, artists, albums, or playlists..."
            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-base text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all shadow-xl"
            autoFocus
          />
        </div>

        {/* Filters */}
        {hasResults && (
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            {[
              { key: 'all', label: 'All Results' },
              { key: 'songs', label: 'Songs', icon: Music },
              { key: 'artists', label: 'Artists', icon: Mic2 },
              { key: 'albums', label: 'Albums', icon: Disc },
              { key: 'playlists', label: 'Playlists', icon: ListMusic },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  filter === tab.key
                    ? 'bg-purple-600 text-white shadow-glow'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* No Search Query Initial State */}
      {!loading && !query && (
        <EmptyState
          title="Search MusicWave"
          description="Find your favorite tracks, artists, studio albums, and community playlists."
        />
      )}

      {/* No Results Found */}
      {!loading && query && !hasResults && (
        <EmptyState
          title={`No results found for "${query}"`}
          description="Try checking for typos or searching with different keywords."
        />
      )}

      {/* Search Results Display */}
      {!loading && results && hasResults && (
        <div className="space-y-8">
          {/* Songs */}
          {(filter === 'all' || filter === 'songs') && results.songs.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" />
                <span>Songs</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.songs.map((song) => (
                  <SongCard key={song.id} song={song} playlistContext={results.songs} />
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {(filter === 'all' || filter === 'artists') && results.artists.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-pink-400" />
                <span>Artists</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {(filter === 'all' || filter === 'albums') && results.albums.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Disc className="w-4 h-4 text-cyan-400" />
                <span>Albums</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {(filter === 'all' || filter === 'playlists') && results.playlists.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-amber-400" />
                <span>Playlists</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
