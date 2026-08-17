"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSongFromPlaylist = exports.addSongToPlaylist = exports.deletePlaylist = exports.updatePlaylist = exports.createPlaylist = exports.getPlaylistById = exports.getUserPlaylists = exports.getPublicPlaylists = void 0;
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const getPublicPlaylists = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const playlists = await db_1.prisma.playlist.findMany({
            where: { isPublic: true },
            take: Number(limit),
            include: {
                user: { select: { id: true, username: true, avatar: true } },
                _count: { select: { songs: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return (0, response_1.sendSuccess)(res, playlists);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch public playlists', 500, error);
    }
};
exports.getPublicPlaylists = getPublicPlaylists;
const getUserPlaylists = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        const playlists = await db_1.prisma.playlist.findMany({
            where: { userId: req.user.id },
            include: {
                _count: { select: { songs: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return (0, response_1.sendSuccess)(res, playlists);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch user playlists', 500, error);
    }
};
exports.getUserPlaylists = getUserPlaylists;
const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;
        const playlist = await db_1.prisma.playlist.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, username: true, avatar: true } },
                songs: {
                    orderBy: { order: 'asc' },
                    include: {
                        song: {
                            include: {
                                artist: { select: { id: true, name: true } },
                                album: { select: { id: true, title: true, coverUrl: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!playlist)
            return (0, response_1.sendError)(res, 'Playlist not found', 404);
        return (0, response_1.sendSuccess)(res, playlist);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch playlist', 500, error);
    }
};
exports.getPlaylistById = getPlaylistById;
const createPlaylist = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        const { name, description, isPublic, coverUrl } = req.body;
        if (!name)
            return (0, response_1.sendError)(res, 'Playlist name is required', 400);
        const playlist = await db_1.prisma.playlist.create({
            data: {
                name,
                description,
                isPublic: isPublic ?? true,
                coverUrl: coverUrl || `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80`,
                userId: req.user.id,
            },
        });
        return (0, response_1.sendSuccess)(res, playlist, 'Playlist created successfully', 201);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to create playlist', 500, error);
    }
};
exports.createPlaylist = createPlaylist;
const updatePlaylist = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        const { id } = req.params;
        const { name, description, isPublic, coverUrl } = req.body;
        const existing = await db_1.prisma.playlist.findUnique({ where: { id } });
        if (!existing)
            return (0, response_1.sendError)(res, 'Playlist not found', 404);
        if (existing.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return (0, response_1.sendError)(res, 'Not authorized to edit this playlist', 403);
        }
        const updated = await db_1.prisma.playlist.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(isPublic !== undefined && { isPublic }),
                ...(coverUrl !== undefined && { coverUrl }),
            },
        });
        return (0, response_1.sendSuccess)(res, updated, 'Playlist updated');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to update playlist', 500, error);
    }
};
exports.updatePlaylist = updatePlaylist;
const deletePlaylist = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        const { id } = req.params;
        const existing = await db_1.prisma.playlist.findUnique({ where: { id } });
        if (!existing)
            return (0, response_1.sendError)(res, 'Playlist not found', 404);
        if (existing.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return (0, response_1.sendError)(res, 'Not authorized to delete this playlist', 403);
        }
        await db_1.prisma.playlist.delete({ where: { id } });
        return (0, response_1.sendSuccess)(res, null, 'Playlist deleted');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to delete playlist', 500, error);
    }
};
exports.deletePlaylist = deletePlaylist;
const addSongToPlaylist = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        const { id: playlistId } = req.params;
        const { songId } = req.body;
        if (!songId)
            return (0, response_1.sendError)(res, 'songId is required', 400);
        const playlist = await db_1.prisma.playlist.findUnique({ where: { id: playlistId } });
        if (!playlist)
            return (0, response_1.sendError)(res, 'Playlist not found', 404);
        if (playlist.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return (0, response_1.sendError)(res, 'Not authorized to modify this playlist', 403);
        }
        const currentCount = await db_1.prisma.playlistSong.count({ where: { playlistId } });
        const item = await db_1.prisma.playlistSong.create({
            data: {
                playlistId,
                songId,
                order: currentCount + 1,
            },
        });
        return (0, response_1.sendSuccess)(res, item, 'Song added to playlist', 201);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return (0, response_1.sendError)(res, 'Song is already in playlist', 400);
        }
        return (0, response_1.sendError)(res, 'Failed to add song to playlist', 500, error);
    }
};
exports.addSongToPlaylist = addSongToPlaylist;
const removeSongFromPlaylist = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        const { id: playlistId, songId } = req.params;
        const playlist = await db_1.prisma.playlist.findUnique({ where: { id: playlistId } });
        if (!playlist)
            return (0, response_1.sendError)(res, 'Playlist not found', 404);
        if (playlist.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return (0, response_1.sendError)(res, 'Not authorized to modify this playlist', 403);
        }
        await db_1.prisma.playlistSong.delete({
            where: {
                playlistId_songId: { playlistId, songId },
            },
        });
        return (0, response_1.sendSuccess)(res, null, 'Song removed from playlist');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to remove song from playlist', 500, error);
    }
};
exports.removeSongFromPlaylist = removeSongFromPlaylist;
