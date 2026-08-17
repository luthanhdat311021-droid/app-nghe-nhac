"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrendingSongs = exports.incrementPlayCount = exports.getSongById = exports.getSongs = void 0;
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const getSongs = async (req, res) => {
    try {
        const { genre, artistId, albumId, limit = 50, sort = 'recent' } = req.query;
        const where = {};
        if (genre)
            where.genre = { slug: String(genre) };
        if (artistId)
            where.artistId = String(artistId);
        if (albumId)
            where.albumId = String(albumId);
        let orderBy = { createdAt: 'desc' };
        if (sort === 'popular')
            orderBy = { playCount: 'desc' };
        if (sort === 'title')
            orderBy = { title: 'asc' };
        const songs = await db_1.prisma.song.findMany({
            where,
            take: Number(limit),
            orderBy,
            include: {
                artist: { select: { id: true, name: true, avatar: true, verified: true } },
                album: { select: { id: true, title: true, coverUrl: true } },
                genre: { select: { id: true, name: true, slug: true } },
            },
        });
        return (0, response_1.sendSuccess)(res, songs);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch songs', 500, error);
    }
};
exports.getSongs = getSongs;
const getSongById = async (req, res) => {
    try {
        const { id } = req.params;
        const song = await db_1.prisma.song.findUnique({
            where: { id },
            include: {
                artist: { select: { id: true, name: true, avatar: true, biography: true, verified: true } },
                album: { select: { id: true, title: true, coverUrl: true, releaseDate: true } },
                genre: true,
            },
        });
        if (!song)
            return (0, response_1.sendError)(res, 'Song not found', 404);
        return (0, response_1.sendSuccess)(res, song);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch song details', 500, error);
    }
};
exports.getSongById = getSongById;
const incrementPlayCount = async (req, res) => {
    try {
        const { id } = req.params;
        const song = await db_1.prisma.song.update({
            where: { id },
            data: { playCount: { increment: 1 } },
            select: { id: true, playCount: true },
        });
        return (0, response_1.sendSuccess)(res, song, 'Play count updated');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to update play count', 500, error);
    }
};
exports.incrementPlayCount = incrementPlayCount;
const getTrendingSongs = async (_req, res) => {
    try {
        const songs = await db_1.prisma.song.findMany({
            take: 10,
            orderBy: { playCount: 'desc' },
            include: {
                artist: { select: { id: true, name: true, avatar: true } },
                album: { select: { id: true, title: true, coverUrl: true } },
            },
        });
        return (0, response_1.sendSuccess)(res, songs);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch trending songs', 500, error);
    }
};
exports.getTrendingSongs = getTrendingSongs;
