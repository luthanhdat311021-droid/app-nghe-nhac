import { Response } from 'express';
import { prisma } from '../config/db';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getArtists = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = 20 } = req.query;
    const artists = await prisma.artist.findMany({
      take: Number(limit),
      include: {
        _count: {
          select: { songs: true, albums: true, followers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, artists);
  } catch (error) {
    return sendError(res, 'Failed to fetch artists', 500, error);
  }
};

export const getArtistById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        songs: {
          include: {
            album: { select: { id: true, title: true, coverUrl: true } },
          },
          orderBy: { playCount: 'desc' },
        },
        albums: {
          orderBy: { releaseDate: 'desc' },
        },
        _count: {
          select: { followers: true },
        },
      },
    });

    if (!artist) return sendError(res, 'Artist not found', 404);

    let isFollowing = false;
    if (req.user) {
      const follow = await prisma.follower.findUnique({
        where: {
          userId_artistId: {
            userId: req.user.id,
            artistId: id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return sendSuccess(res, { ...artist, isFollowing });
  } catch (error) {
    return sendError(res, 'Failed to fetch artist profile', 500, error);
  }
};

export const toggleFollowArtist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const { id: artistId } = req.params;
    const userId = req.user.id;

    const existing = await prisma.follower.findUnique({
      where: {
        userId_artistId: { userId, artistId },
      },
    });

    if (existing) {
      await prisma.follower.delete({
        where: { id: existing.id },
      });
      return sendSuccess(res, { isFollowing: false }, 'Unfollowed artist');
    } else {
      await prisma.follower.create({
        data: { userId, artistId },
      });
      return sendSuccess(res, { isFollowing: true }, 'Followed artist');
    }
  } catch (error) {
    return sendError(res, 'Failed to toggle follow status', 500, error);
  }
};
