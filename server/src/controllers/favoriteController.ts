import { Response } from 'express';
import { prisma } from '../config/db';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getFavorites = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);

    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        song: {
          include: {
            artist: { select: { id: true, name: true, avatar: true } },
            album: { select: { id: true, title: true, coverUrl: true } },
          },
        },
      },
    });

    return sendSuccess(res, favorites);
  } catch (error) {
    return sendError(res, 'Failed to fetch favorites', 500, error);
  }
};

export const addFavorite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const { songId } = req.params;

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        songId,
      },
    });

    return sendSuccess(res, favorite, 'Song added to favorites', 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return sendError(res, 'Song is already in favorites', 400);
    }
    return sendError(res, 'Failed to add favorite', 500, error);
  }
};

export const removeFavorite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const { songId } = req.params;

    await prisma.favorite.delete({
      where: {
        userId_songId: {
          userId: req.user.id,
          songId,
        },
      },
    });

    return sendSuccess(res, null, 'Song removed from favorites');
  } catch (error) {
    return sendError(res, 'Failed to remove favorite', 500, error);
  }
};

export const getFavoriteIds = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendSuccess(res, []);
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      select: { songId: true },
    });
    return sendSuccess(res, favorites.map((f) => f.songId));
  } catch (error) {
    return sendError(res, 'Failed to fetch favorite IDs', 500, error);
  }
};
