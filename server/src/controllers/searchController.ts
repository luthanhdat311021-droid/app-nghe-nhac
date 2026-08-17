import { Response } from 'express';
import { prisma } from '../config/db';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const globalSearch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();

    if (!q) {
      return sendSuccess(res, {
        songs: [],
        artists: [],
        albums: [],
        playlists: [],
      });
    }

    const [songs, artists, albums, playlists] = await Promise.all([
      prisma.song.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { artist: { name: { contains: q } } },
          ],
        },
        take: 10,
        include: {
          artist: { select: { id: true, name: true, avatar: true } },
          album: { select: { id: true, title: true, coverUrl: true } },
        },
      }),
      prisma.artist.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { biography: { contains: q } },
          ],
        },
        take: 8,
        include: {
          _count: { select: { followers: true, songs: true } },
        },
      }),
      prisma.album.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { artist: { name: { contains: q } } },
          ],
        },
        take: 8,
        include: {
          artist: { select: { id: true, name: true } },
        },
      }),
      prisma.playlist.findMany({
        where: {
          isPublic: true,
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: 8,
        include: {
          user: { select: { id: true, username: true } },
          _count: { select: { songs: true } },
        },
      }),
    ]);

    return sendSuccess(res, { songs, artists, albums, playlists });
  } catch (error) {
    return sendError(res, 'Search query failed', 500, error);
  }
};
