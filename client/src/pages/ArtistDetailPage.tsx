import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, UserPlus, UserCheck, Play } from 'lucide-react';
import { artistService } from '../services/artistService';
import { Artist, Song } from '../types';
import { SongListItem } from '../components/common/SongListItem';
import { AlbumCard } from '../components/common/AlbumCard';
import { SkeletonCard, SkeletonRow } from '../components/common/Skeleton';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';

export const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { playSong } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchArtist = async () => {
      setLoading(true);
      try {
        const data = await artistService.getArtistById(id);
        setArtist(data);
      } catch (err) {
        console.error('Failed to load artist details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!artist || !isAuthenticated) return;
    try {
      if (isFollowing) {
        await artistService.unfollowArtist(artist.id);
        setIsFollowing(false);
      } else {
        await artistService.followArtist(artist.id);
        setIsFollowing(true);
      }
    } catch (_e) {
      // Ignore
    }
  };

  const handlePlayArtist = () => {
    if (artist?.songs && artist.songs.length > 0) {
      playSong(artist.songs[0], artist.songs);
    }
  };

  if (loading || !artist) {
    return (
      <div className="space-y-6">
        <SkeletonRow />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Banner / Header */}
      <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden bg-gradient-to-r from-purple-900/40 via-purple-950/60 to-black border border-white/10 flex flex-col md:flex-row items-center gap-8">
        <img
          src={artist.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80'}
          alt={artist.name}
          className="w-36 h-36 md:w-48 md:h-48 rounded-full object-cover shadow-2xl border-4 border-purple-500/30"
        />
        <div className="space-y-3 text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            {artist.verified && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 fill-current" />
                <span>Verified Artist</span>
              </span>
            )}
            {artist.country && (
              <span className="text-xs text-gray-400 font-medium">{artist.country}</span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white">{artist.name}</h1>
          <p className="text-xs md:text-sm text-gray-300 max-w-xl line-clamp-3">{artist.biography}</p>

          <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
            <button
              onClick={handlePlayArtist}
              className="px-6 py-3 rounded-full bg-gradient-primary hover:bg-gradient-hover text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Popular Tracks</span>
            </button>

            <button
              onClick={handleFollowToggle}
              className={`px-5 py-3 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-2 transition-all border ${
                isFollowing
                  ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
              }`}
            >
              {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Popular Songs */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-white">Popular Tracks</h2>
        <div className="space-y-2">
          {artist.songs?.map((song, index) => (
            <SongListItem
              key={song.id}
              song={song}
              index={index}
              playlistContext={artist.songs}
            />
          ))}
        </div>
      </section>

      {/* Discography Albums */}
      {artist.albums && artist.albums.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-white">Albums & EPs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artist.albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
