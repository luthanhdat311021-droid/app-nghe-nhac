"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavoriteIds = exports.removeFavorite = exports.addFavorite = exports.getFavorites = void 0;
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const getFavorites = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        const favorites = await db_1.prisma.favorite.findMany({
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
        return (0, response_1.sendSuccess)(res, favorites);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch favorites', 500, error);
    }
};
exports.getFavorites = getFavorites;
const addFavorite = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        const { songId } = req.params;
        const favorite = await db_1.prisma.favorite.create({
            data: {
                userId: req.user.id,
                songId,
            },
        });
        return (0, response_1.sendSuccess)(res, favorite, 'Song added to favorites', 201);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return (0, response_1.sendError)(res, 'Song is already in favorites', 400);
        }
        return (0, response_1.sendError)(res, 'Failed to add favorite', 500, error);
    }
};
exports.addFavorite = addFavorite;
const removeFavorite = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        const { songId } = req.params;
        await db_1.prisma.favorite.delete({
            where: {
                userId_songId: {
                    userId: req.user.id,
                    songId,
                },
            },
        });
        return (0, response_1.sendSuccess)(res, null, 'Song removed from favorites');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to remove favorite', 500, error);
    }
};
exports.removeFavorite = removeFavorite;
const getFavoriteIds = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendSuccess)(res, []);
        const favorites = await db_1.prisma.favorite.findMany({
            where: { userId: req.user.id },
            select: { songId: true },
        });
        return (0, response_1.sendSuccess)(res, favorites.map((f) => f.songId));
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch favorite IDs', 500, error);
    }
};
exports.getFavoriteIds = getFavoriteIds;
