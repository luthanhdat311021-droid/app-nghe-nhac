"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalSearch = void 0;
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const globalSearch = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) {
            return (0, response_1.sendSuccess)(res, {
                songs: [],
                artists: [],
                albums: [],
                playlists: [],
            });
        }
        const [songs, artists, albums, playlists] = await Promise.all([
            db_1.prisma.song.findMany({
                where: {
                    OR: [
                        { title: { contains: q } },
                        { artist: { name: { contains: q } } },
                    ],
                },
                take: 10,
                include: {
                    artist: { select: { id: true, name: true, avatar: true } },
                    album: { select: { id: true, title: true, coverUrl: true } },
                },
            }),
            db_1.prisma.artist.findMany({
                where: {
                    OR: [
                        { name: { contains: q } },
                        { biography: { contains: q } },
                    ],
                },
                take: 8,
                include: {
                    _count: { select: { followers: true, songs: true } },
                },
            }),
            db_1.prisma.album.findMany({
                where: {
                    OR: [
                        { title: { contains: q } },
                        { artist: { name: { contains: q } } },
                    ],
                },
                take: 8,
                include: {
                    artist: { select: { id: true, name: true } },
                },
            }),
            db_1.prisma.playlist.findMany({
                where: {
                    isPublic: true,
                    OR: [
                        { name: { contains: q } },
                        { description: { contains: q } },
                    ],
                },
                take: 8,
                include: {
                    user: { select: { id: true, username: true } },
                    _count: { select: { songs: true } },
                },
            }),
        ]);
        return (0, response_1.sendSuccess)(res, { songs, artists, albums, playlists });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Search query failed', 500, error);
    }
};
exports.globalSearch = globalSearch;
