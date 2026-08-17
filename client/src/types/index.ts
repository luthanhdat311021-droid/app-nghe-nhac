export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string | null;
  bio?: string | null;
  isLocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Artist {
  id: string;
  name: string;
  avatar?: string | null;
  biography?: string | null;
  country?: string | null;
  verified: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    songs?: number;
    albums?: number;
    followers?: number;
  };
  songs?: Song[];
  albums?: Album[];
}

export interface Album {
  id: string;
  title: string;
  coverUrl?: string | null;
  releaseDate?: string | null;
  description?: string | null;
  artistId: string;
  artist?: Artist;
  songs?: Song[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  songs?: Song[];
}

export interface Song {
  id: string;
  title: string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl?: string | null;
  lyrics?: string | null;
  releaseDate?: string | null;
  playCount: number;
  artistId: string;
  artist?: Artist;
  albumId?: string | null;
  album?: Album;
  genreId?: string | null;
  genre?: Genre;
  isFavorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  isPublic: boolean;
  userId: string;
  user?: User;
  songs?: PlaylistSong[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PlaylistSong {
  id: string;
  playlistId: string;
  songId: string;
  order: number;
  addedAt: string;
  song: Song;
}

export interface Favorite {
  id: string;
  userId: string;
  songId: string;
  createdAt: string;
  song: Song;
}

export interface RecentlyPlayed {
  id: string;
  userId: string;
  songId: string;
  playedAt: string;
  song: Song;
}

export interface SearchResults {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

export interface AdminStats {
  totalUsers: number;
  totalSongs: number;
  totalArtists: number;
  totalAlbums: number;
  totalPlaylists: number;
  totalPlays: number;
  recentUsers: User[];
  topSongs: Song[];
}

export type RepeatMode = 'off' | 'all' | 'one';
