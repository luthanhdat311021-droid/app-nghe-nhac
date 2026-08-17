import { Response } from 'express';
import { prisma } from '../config/db';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAdminStats = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [totalUsers, totalSongs, totalArtists, totalAlbums, totalPlaylists, playCountSum] = await Promise.all([
      prisma.user.count(),
      prisma.song.count(),
      prisma.artist.count(),
      prisma.album.count(),
      prisma.playlist.count(),
      prisma.song.aggregate({ _sum: { playCount: true } }),
    ]);

    const totalPlays = playCountSum._sum.playCount || 0;

    const topSongs = await prisma.song.findMany({
      take: 5,
      orderBy: { playCount: 'desc' },
      include: {
        artist: { select: { name: true } },
      },
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });

    // Dummy analytical play history for chart demo
    const chartData = [
      { day: 'Mon', plays: 1240, newUsers: 14 },
      { day: 'Tue', plays: 1890, newUsers: 22 },
      { day: 'Wed', plays: 2390, newUsers: 30 },
      { day: 'Thu', plays: 3490, newUsers: 45 },
      { day: 'Fri', plays: 4200, newUsers: 60 },
      { day: 'Sat', plays: 5600, newUsers: 85 },
      { day: 'Sun', plays: 6100, newUsers: 92 },
    ];

    return sendSuccess(res, {
      totalUsers,
      totalSongs,
      totalArtists,
      totalAlbums,
      totalPlaylists,
      totalPlays,
      topSongs,
      recentUsers,
      chartData,
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch admin stats', 500, error);
  }
};

// --- SONG CRUD ---
export const createSong = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      artistId,
      albumId,
      genreId,
      sourceType = 'DIRECT_URL',
      audioUrl,
      youtubeVideoId,
      coverUrl,
      lyrics,
      duration,
      releaseDate,
    } = req.body;

    if (!title) {
      return sendError(res, 'Song title is required', 400);
    }

    let targetArtistId = artistId;
    if (!targetArtistId) {
      const existingArtist = await prisma.artist.findFirst();
      if (existingArtist) {
        targetArtistId = existingArtist.id;
      } else {
        const newArtist = await prisma.artist.create({
          data: {
            name: 'MusicWave Artist',
            biography: 'Featured MusicWave Creator',
            avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
          },
        });
        targetArtistId = newArtist.id;
      }
    }

    if (sourceType === 'YOUTUBE' && !youtubeVideoId) {
      return sendError(res, 'YouTube Video ID or valid YouTube URL is required', 400);
    }

    const finalAudioUrl = sourceType === 'YOUTUBE'
      ? null
      : (audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

    const finalCoverUrl = coverUrl || (sourceType === 'YOUTUBE' && youtubeVideoId ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80');

    const song = await prisma.song.create({
      data: {
        title,
        artistId: targetArtistId,
        albumId: albumId || null,
        genreId: genreId || null,
        sourceType: sourceType || 'DIRECT_URL',
        audioUrl: finalAudioUrl,
        youtubeVideoId: youtubeVideoId || null,
        coverUrl: finalCoverUrl,
        lyrics: lyrics || null,
        duration: duration ? Number(duration) : 180,
        releaseDate: releaseDate || new Date().toISOString().split('T')[0],
      },
      include: {
        artist: true,
        album: true,
        genre: true,
      },
    });

    return sendSuccess(res, song, 'Song created successfully', 201);
  } catch (error) {
    console.error('Failed to create song error:', error);
    return sendError(res, 'Failed to create song', 500, error);
  }
};

export const updateSong = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      artistId,
      albumId,
      genreId,
      sourceType,
      audioUrl,
      youtubeVideoId,
      coverUrl,
      lyrics,
      duration,
      releaseDate,
    } = req.body;

    const song = await prisma.song.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(artistId && { artistId }),
        ...(albumId !== undefined && { albumId: albumId || null }),
        ...(genreId !== undefined && { genreId: genreId || null }),
        ...(sourceType && { sourceType }),
        ...(audioUrl !== undefined && { audioUrl: audioUrl || null }),
        ...(youtubeVideoId !== undefined && { youtubeVideoId: youtubeVideoId || null }),
        ...(coverUrl !== undefined && { coverUrl: coverUrl || null }),
        ...(lyrics !== undefined && { lyrics: lyrics || null }),
        ...(duration && { duration: Number(duration) }),
        ...(releaseDate && { releaseDate }),
      },
      include: {
        artist: true,
        album: true,
        genre: true,
      },
    });

    return sendSuccess(res, song, 'Song updated');
  } catch (error) {
    return sendError(res, 'Failed to update song', 500, error);
  }
};

export const deleteSong = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.song.delete({ where: { id } });
    return sendSuccess(res, null, 'Song deleted');
  } catch (error) {
    return sendError(res, 'Failed to delete song', 500, error);
  }
};

// --- ARTIST CRUD ---
export const createArtist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, avatar, biography, country, verified } = req.body;
    if (!name) return sendError(res, 'Artist name is required', 400);

    const artist = await prisma.artist.create({
      data: {
        name,
        avatar: avatar || `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80`,
        biography: biography || null,
        country: country || null,
        verified: verified ?? false,
      },
    });

    return sendSuccess(res, artist, 'Artist created', 201);
  } catch (error) {
    return sendError(res, 'Failed to create artist', 500, error);
  }
};

export const updateArtist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, avatar, biography, country, verified } = req.body;

    const artist = await prisma.artist.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(avatar !== undefined && { avatar }),
        ...(biography !== undefined && { biography }),
        ...(country !== undefined && { country }),
        ...(verified !== undefined && { verified }),
      },
    });

    return sendSuccess(res, artist, 'Artist updated');
  } catch (error) {
    return sendError(res, 'Failed to update artist', 500, error);
  }
};

export const deleteArtist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.artist.delete({ where: { id } });
    return sendSuccess(res, null, 'Artist deleted');
  } catch (error) {
    return sendError(res, 'Failed to delete artist', 500, error);
  }
};

// --- ALBUM CRUD ---
export const createAlbum = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, artistId, coverUrl, releaseDate, description } = req.body;
    if (!title || !artistId) return sendError(res, 'Title and artistId are required', 400);

    const album = await prisma.album.create({
      data: {
        title,
        artistId,
        coverUrl: coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80`,
        releaseDate: releaseDate || new Date().toISOString().split('T')[0],
        description: description || null,
      },
      include: { artist: true },
    });

    return sendSuccess(res, album, 'Album created', 201);
  } catch (error) {
    return sendError(res, 'Failed to create album', 500, error);
  }
};

export const updateAlbum = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, artistId, coverUrl, releaseDate, description } = req.body;

    const album = await prisma.album.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(artistId && { artistId }),
        ...(coverUrl !== undefined && { coverUrl }),
        ...(releaseDate !== undefined && { releaseDate }),
        ...(description !== undefined && { description }),
      },
      include: { artist: true },
    });

    return sendSuccess(res, album, 'Album updated');
  } catch (error) {
    return sendError(res, 'Failed to update album', 500, error);
  }
};

export const deleteAlbum = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.album.delete({ where: { id } });
    return sendSuccess(res, null, 'Album deleted');
  } catch (error) {
    return sendError(res, 'Failed to delete album', 500, error);
  }
};

// --- USER MANAGEMENT ---
export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search } = req.query;
    const where: any = {};
    if (search) {
      where.OR = [
        { username: { contains: String(search) } },
        { email: { contains: String(search) } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isLocked: true,
        avatar: true,
        createdAt: true,
        _count: { select: { playlists: true, favorites: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, users);
  } catch (error) {
    return sendError(res, 'Failed to fetch users', 500, error);
  }
};

export const toggleUserLock = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return sendError(res, 'User not found', 404);
    if (user.role === 'ADMIN' && req.user?.id === user.id) {
      return sendError(res, 'Cannot lock your own admin account', 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isLocked: !user.isLocked },
      select: { id: true, username: true, isLocked: true },
    });

    return sendSuccess(res, updated, `User ${updated.isLocked ? 'locked' : 'unlocked'}`);
  } catch (error) {
    return sendError(res, 'Failed to toggle user lock', 500, error);
  }
};

export const changeUserRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return sendError(res, 'Valid role (USER or ADMIN) is required', 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    return sendSuccess(res, updated, 'User role updated');
  } catch (error) {
    return sendError(res, 'Failed to change user role', 500, error);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (req.user?.id === id) {
      return sendError(res, 'Cannot delete your own admin account', 400);
    }
    await prisma.user.delete({ where: { id } });
    return sendSuccess(res, null, 'User deleted');
  } catch (error) {
    return sendError(res, 'Failed to delete user', 500, error);
  }
};
