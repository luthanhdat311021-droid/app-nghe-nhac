import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Mic2, Disc, Layers } from 'lucide-react';
import { songService } from '../services/songService';
import { artistService } from '../services/artistService';
import { albumService } from '../services/albumService';
import { Genre, Artist, Album, Song } from '../types';
import { ArtistCard } from '../components/common/ArtistCard';
import { AlbumCard } from '../components/common/AlbumCard';
import { SongCard } from '../components/common/SongCard';
import { SkeletonCard } from '../components/common/Skeleton';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'genres';

  const [genres, setGenres] = useState<Genre[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genreSongs, setGenreSongs] = useState<Song[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExploreData = async () => {
      setLoading(true);
      try {
        const [gList, aList, albList] = await Promise.all([
          songService.getGenres(),
          artistService.getArtists(),
          albumService.getAlbums(),
        ]);
        setGenres(gList);
        setArtists(aList);
        setAlbums(albList);
      } catch (err) {
        console.error('Failed to load explore data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadExploreData();
  }, []);

  const handleGenreClick = async (slug: string) => {
    setSelectedGenre(slug);
    try {
      const songs = await songService.getSongs({ genre: slug });
      setGenreSongs(songs);
    } catch (_e) {
      // Ignore
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Explore Music</h1>
            <p className="text-xs text-gray-400">Discover genres, artists, and albums from across the globe.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 mt-6 border-b border-white/10 pb-3">
          <button
            onClick={() => setSearchParams({ tab: 'genres' })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'genres'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Genres</span>
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'artists' })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'artists'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mic2 className="w-4 h-4" />
            <span>Artists</span>
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'albums' })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'albums'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>Albums</span>
          </button>
        </div>
      </div>

      {/* Genres Tab */}
      {activeTab === 'genres' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {genres.map((g) => (
              <div
                key={g.id}
                onClick={() => handleGenreClick(g.slug)}
                className={`relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer group border transition-all ${
                  selectedGenre === g.slug ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img
                  src={g.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80'}
                  alt={g.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex items-end">
                  <h3 className="font-extrabold text-base md:text-lg text-white group-hover:text-purple-300 transition-colors">
                    {g.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {selectedGenre && (
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider text-purple-400">
                Genre: {selectedGenre}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {genreSongs.map((song) => (
                  <SongCard key={song.id} song={song} playlistContext={genreSongs} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Artists Tab */}
      {activeTab === 'artists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}
        </div>
      )}

      {/* Albums Tab */}
      {activeTab === 'albums' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : albums.map((album) => <AlbumCard key={album.id} album={album} />)}
        </div>
      )}
    </div>
  );
};
