import { Response } from 'express';
import { prisma } from '../config/db';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getSongs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { genre, artistId, albumId, limit = 50, sort = 'recent' } = req.query;

    const where: any = {};
    if (genre) where.genre = { slug: String(genre) };
    if (artistId) where.artistId = String(artistId);
    if (albumId) where.albumId = String(albumId);

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'popular') orderBy = { playCount: 'desc' };
    if (sort === 'title') orderBy = { title: 'asc' };

    const songs = await prisma.song.findMany({
      where,
      take: Number(limit),
      orderBy,
      include: {
        artist: { select: { id: true, name: true, avatar: true, verified: true } },
        album: { select: { id: true, title: true, coverUrl: true } },
        genre: { select: { id: true, name: true, slug: true } },
      },
    });

    return sendSuccess(res, songs);
  } catch (error) {
    return sendError(res, 'Failed to fetch songs', 500, error);
  }
};

export const getSongById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        artist: { select: { id: true, name: true, avatar: true, biography: true, verified: true } },
        album: { select: { id: true, title: true, coverUrl: true, releaseDate: true } },
        genre: true,
      },
    });

    if (!song) return sendError(res, 'Song not found', 404);

    return sendSuccess(res, song);
  } catch (error) {
    return sendError(res, 'Failed to fetch song details', 500, error);
  }
};

export const incrementPlayCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const song = await prisma.song.update({
      where: { id },
      data: { playCount: { increment: 1 } },
      select: { id: true, playCount: true },
    });

    return sendSuccess(res, song, 'Play count updated');
  } catch (error) {
    return sendError(res, 'Failed to update play count', 500, error);
  }
};

export const getTrendingSongs = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const songs = await prisma.song.findMany({
      take: 10,
      orderBy: { playCount: 'desc' },
      include: {
        artist: { select: { id: true, name: true, avatar: true } },
        album: { select: { id: true, title: true, coverUrl: true } },
      },
    });
    return sendSuccess(res, songs);
  } catch (error) {
    return sendError(res, 'Failed to fetch trending songs', 500, error);
  }
};
