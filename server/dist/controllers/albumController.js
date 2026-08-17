"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumById = exports.getAlbums = void 0;
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const getAlbums = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const albums = await db_1.prisma.album.findMany({
            take: Number(limit),
            include: {
                artist: { select: { id: true, name: true } },
                _count: { select: { songs: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return (0, response_1.sendSuccess)(res, albums);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch albums', 500, error);
    }
};
exports.getAlbums = getAlbums;
const getAlbumById = async (req, res) => {
    try {
        const { id } = req.params;
        const album = await db_1.prisma.album.findUnique({
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
        if (!album)
            return (0, response_1.sendError)(res, 'Album not found', 404);
        return (0, response_1.sendSuccess)(res, album);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch album', 500, error);
    }
};
exports.getAlbumById = getAlbumById;
