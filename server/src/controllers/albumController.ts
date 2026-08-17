import { Response } from 'express';
import { prisma } from '../config/db';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAlbums = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = 20 } = req.query;
    const albums = await prisma.album.findMany({
      take: Number(limit),
      include: {
        artist: { select: { id: true, name: true } },
        _count: { select: { songs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, albums);
  } catch (error) {
    return sendError(res, 'Failed to fetch albums', 500, error);
  }
};

export const getAlbumById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: { select: { id: true, name: true, avatar: true } },
        songs: {
          include: {
            artist: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!album) return sendError(res, 'Album not found', 404);

    return sendSuccess(res, album);
  } catch (error) {
    return sendError(res, 'Failed to fetch album', 500, error);
  }
};
