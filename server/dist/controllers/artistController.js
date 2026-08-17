"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFollowArtist = exports.getArtistById = exports.getArtists = void 0;
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const getArtists = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const artists = await db_1.prisma.artist.findMany({
            take: Number(limit),
            include: {
                _count: {
                    select: { songs: true, albums: true, followers: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return (0, response_1.sendSuccess)(res, artists);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch artists', 500, error);
    }
};
exports.getArtists = getArtists;
const getArtistById = async (req, res) => {
    try {
        const { id } = req.params;
        const artist = await db_1.prisma.artist.findUnique({
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
        if (!artist)
            return (0, response_1.sendError)(res, 'Artist not found', 404);
        let isFollowing = false;
        if (req.user) {
            const follow = await db_1.prisma.follower.findUnique({
                where: {
                    userId_artistId: {
                        userId: req.user.id,
                        artistId: id,
                    },
                },
            });
            isFollowing = !!follow;
        }
        return (0, response_1.sendSuccess)(res, { ...artist, isFollowing });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch artist profile', 500, error);
    }
};
exports.getArtistById = getArtistById;
const toggleFollowArtist = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        const { id: artistId } = req.params;
        const userId = req.user.id;
        const existing = await db_1.prisma.follower.findUnique({
            where: {
                userId_artistId: { userId, artistId },
            },
        });
        if (existing) {
            await db_1.prisma.follower.delete({
                where: { id: existing.id },
            });
            return (0, response_1.sendSuccess)(res, { isFollowing: false }, 'Unfollowed artist');
        }
        else {
            await db_1.prisma.follower.create({
                data: { userId, artistId },
            });
            return (0, response_1.sendSuccess)(res, { isFollowing: true }, 'Followed artist');
        }
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to toggle follow status', 500, error);
    }
};
exports.toggleFollowArtist = toggleFollowArtist;
