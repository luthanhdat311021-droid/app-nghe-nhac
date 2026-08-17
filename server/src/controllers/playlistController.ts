import { Response } from 'express';
import { prisma } from '../config/db';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getPublicPlaylists = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = 20 } = req.query;
    const playlists = await prisma.playlist.findMany({
      where: { isPublic: true },
      take: Number(limit),
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { songs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, playlists);
  } catch (error) {
    return sendError(res, 'Failed to fetch public playlists', 500, error);
  }
};

export const getUserPlaylists = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);

    const playlists = await prisma.playlist.findMany({
      where: { userId: req.user.id },
      include: {
        _count: { select: { songs: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return sendSuccess(res, playlists);
  } catch (error) {
    return sendError(res, 'Failed to fetch user playlists', 500, error);
  }
};

export const getPlaylistById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        songs: {
          orderBy: { order: 'asc' },
          include: {
            song: {
              include: {
                artist: { select: { id: true, name: true } },
                album: { select: { id: true, title: true, coverUrl: true } },
              },
            },
          },
        },
      },
    });

    if (!playlist) return sendError(res, 'Playlist not found', 404);

    return sendSuccess(res, playlist);
  } catch (error) {
    return sendError(res, 'Failed to fetch playlist', 500, error);
  }
};

export const createPlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const { name, description, isPublic, coverUrl } = req.body;

    if (!name) return sendError(res, 'Playlist name is required', 400);

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        isPublic: isPublic ?? true,
        coverUrl: coverUrl || `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80`,
        userId: req.user.id,
      },
    });

    return sendSuccess(res, playlist, 'Playlist created successfully', 201);
  } catch (error) {
    return sendError(res, 'Failed to create playlist', 500, error);
  }
};

export const updatePlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const { id } = req.params;
    const { name, description, isPublic, coverUrl } = req.body;

    const existing = await prisma.playlist.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Playlist not found', 404);
    if (existing.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return sendError(res, 'Not authorized to edit this playlist', 403);
    }

    const updated = await prisma.playlist.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
        ...(coverUrl !== undefined && { coverUrl }),
      },
    });

    return sendSuccess(res, updated, 'Playlist updated');
  } catch (error) {
    return sendError(res, 'Failed to update playlist', 500, error);
  }
};

export const deletePlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const { id } = req.params;

    const existing = await prisma.playlist.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Playlist not found', 404);
    if (existing.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return sendError(res, 'Not authorized to delete this playlist', 403);
    }

    await prisma.playlist.delete({ where: { id } });
    return sendSuccess(res, null, 'Playlist deleted');
  } catch (error) {
    return sendError(res, 'Failed to delete playlist', 500, error);
  }
};

export const addSongToPlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const { id: playlistId } = req.params;
    const { songId } = req.body;

    if (!songId) return sendError(res, 'songId is required', 400);

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) return sendError(res, 'Playlist not found', 404);
    if (playlist.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return sendError(res, 'Not authorized to modify this playlist', 403);
    }

    const currentCount = await prisma.playlistSong.count({ where: { playlistId } });

    const item = await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
        order: currentCount + 1,
      },
    });

    return sendSuccess(res, item, 'Song added to playlist', 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return sendError(res, 'Song is already in playlist', 400);
    }
    return sendError(res, 'Failed to add song to playlist', 500, error);
  }
};

export const removeSongFromPlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const { id: playlistId, songId } = req.params;

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) return sendError(res, 'Playlist not found', 404);
    if (playlist.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return sendError(res, 'Not authorized to modify this playlist', 403);
    }

    await prisma.playlistSong.delete({
      where: {
        playlistId_songId: { playlistId, songId },
      },
    });

    return sendSuccess(res, null, 'Song removed from playlist');
  } catch (error) {
    return sendError(res, 'Failed to remove song from playlist', 500, error);
  }
};
