"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearHistory = exports.recordHistory = exports.getHistory = void 0;
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const getHistory = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        const history = await db_1.prisma.recentlyPlayed.findMany({
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
        return (0, response_1.sendSuccess)(res, history);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch play history', 500, error);
    }
};
exports.getHistory = getHistory;
const recordHistory = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendSuccess)(res, null); // Ignore for guests
        const { songId } = req.body;
        if (!songId)
            return (0, response_1.sendError)(res, 'songId is required', 400);
        const item = await db_1.prisma.recentlyPlayed.create({
            data: {
                userId: req.user.id,
                songId,
            },
        });
        // Also update song playCount
        await db_1.prisma.song.update({
            where: { id: songId },
            data: { playCount: { increment: 1 } },
        });
        return (0, response_1.sendSuccess)(res, item, 'Play history recorded', 201);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to record history', 500, error);
    }
};
exports.recordHistory = recordHistory;
const clearHistory = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        await db_1.prisma.recentlyPlayed.deleteMany({
            where: { userId: req.user.id },
        });
        return (0, response_1.sendSuccess)(res, null, 'Play history cleared');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to clear history', 500, error);
    }
};
exports.clearHistory = clearHistory;
