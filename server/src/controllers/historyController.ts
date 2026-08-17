import { Response } from 'express';
import { prisma } from '../config/db';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);

    const history = await prisma.recentlyPlayed.findMany({
      where: { userId: req.user.id },
      take: 30,
      orderBy: { playedAt: 'desc' },
      include: {
        song: {
          include: {
            artist: { select: { id: true, name: true, avatar: true } },
            album: { select: { id: true, title: true, coverUrl: true } },
          },
        },
      },
    });

    return sendSuccess(res, history);
  } catch (error) {
    return sendError(res, 'Failed to fetch play history', 500, error);
  }
};

export const recordHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendSuccess(res, null); // Ignore for guests
    const { songId } = req.body;

    if (!songId) return sendError(res, 'songId is required', 400);

    const item = await prisma.recentlyPlayed.create({
      data: {
        userId: req.user.id,
        songId,
      },
    });

    // Also update song playCount
    await prisma.song.update({
      where: { id: songId },
      data: { playCount: { increment: 1 } },
    });

    return sendSuccess(res, item, 'Play history recorded', 201);
  } catch (error) {
    return sendError(res, 'Failed to record history', 500, error);
  }
};

export const clearHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);

    await prisma.recentlyPlayed.deleteMany({
      where: { userId: req.user.id },
    });

    return sendSuccess(res, null, 'Play history cleared');
  } catch (error) {
    return sendError(res, 'Failed to clear history', 500, error);
  }
};
