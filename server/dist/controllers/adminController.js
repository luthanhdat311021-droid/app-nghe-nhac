"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.changeUserRole = exports.toggleUserLock = exports.getUsers = exports.deleteAlbum = exports.updateAlbum = exports.createAlbum = exports.deleteArtist = exports.updateArtist = exports.createArtist = exports.deleteSong = exports.updateSong = exports.createSong = exports.getAdminStats = void 0;
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const getAdminStats = async (_req, res) => {
    try {
        const [totalUsers, totalSongs, totalArtists, totalAlbums, totalPlaylists, playCountSum] = await Promise.all([
            db_1.prisma.user.count(),
            db_1.prisma.song.count(),
            db_1.prisma.artist.count(),
            db_1.prisma.album.count(),
            db_1.prisma.playlist.count(),
            db_1.prisma.song.aggregate({ _sum: { playCount: true } }),
        ]);
        const totalPlays = playCountSum._sum.playCount || 0;
        const topSongs = await db_1.prisma.song.findMany({
            take: 5,
            orderBy: { playCount: 'desc' },
            include: {
                artist: { select: { name: true } },
            },
        });
        const recentUsers = await db_1.prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, username: true, email: true, role: true, createdAt: true },
        });
        // Dummy analytical play history for chart demo
        const chartData = [
            { day: 'Mon', plays: 1240, newUsers: 14 },
            { day: 'Tue', plays: 1890, newUsers: 22 },
            { day: 'Wed', plays: 2390, newUsers: 30 },
            { day: 'Thu', plays: 3490, newUsers: 45 },
            { day: 'Fri', plays: 4200, newUsers: 60 },
            { day: 'Sat', plays: 5600, newUsers: 85 },
            { day: 'Sun', plays: 6100, newUsers: 92 },
        ];
        return (0, response_1.sendSuccess)(res, {
            totalUsers,
            totalSongs,
            totalArtists,
            totalAlbums,
            totalPlaylists,
            totalPlays,
            topSongs,
            recentUsers,
            chartData,
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch admin stats', 500, error);
    }
};
exports.getAdminStats = getAdminStats;
// --- SONG CRUD ---
const createSong = async (req, res) => {
    try {
        const { title, artistId, albumId, genreId, audioUrl, coverUrl, lyrics, duration, releaseDate } = req.body;
        if (!title || !artistId || !audioUrl) {
            return (0, response_1.sendError)(res, 'Title, artistId, and audioUrl are required', 400);
        }
        const song = await db_1.prisma.song.create({
            data: {
                title,
                artistId,
                albumId: albumId || null,
                genreId: genreId || null,
                audioUrl,
                coverUrl: coverUrl || null,
                lyrics: lyrics || null,
                duration: duration ? Number(duration) : 180,
                releaseDate: releaseDate || new Date().toISOString().split('T')[0],
            },
            include: {
                artist: true,
                album: true,
                genre: true,
            },
        });
        return (0, response_1.sendSuccess)(res, song, 'Song created successfully', 201);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to create song', 500, error);
    }
};
exports.createSong = createSong;
const updateSong = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, artistId, albumId, genreId, audioUrl, coverUrl, lyrics, duration, releaseDate } = req.body;
        const song = await db_1.prisma.song.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(artistId && { artistId }),
                ...(albumId !== undefined && { albumId: albumId || null }),
                ...(genreId !== undefined && { genreId: genreId || null }),
                ...(audioUrl && { audioUrl }),
                ...(coverUrl !== undefined && { coverUrl: coverUrl || null }),
                ...(lyrics !== undefined && { lyrics: lyrics || null }),
                ...(duration && { duration: Number(duration) }),
                ...(releaseDate && { releaseDate }),
            },
            include: {
                artist: true,
                album: true,
                genre: true,
            },
        });
        return (0, response_1.sendSuccess)(res, song, 'Song updated');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to update song', 500, error);
    }
};
exports.updateSong = updateSong;
const deleteSong = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.song.delete({ where: { id } });
        return (0, response_1.sendSuccess)(res, null, 'Song deleted');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to delete song', 500, error);
    }
};
exports.deleteSong = deleteSong;
// --- ARTIST CRUD ---
const createArtist = async (req, res) => {
    try {
        const { name, avatar, biography, country, verified } = req.body;
        if (!name)
            return (0, response_1.sendError)(res, 'Artist name is required', 400);
        const artist = await db_1.prisma.artist.create({
            data: {
                name,
                avatar: avatar || `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80`,
                biography: biography || null,
                country: country || null,
                verified: verified ?? false,
            },
        });
        return (0, response_1.sendSuccess)(res, artist, 'Artist created', 201);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to create artist', 500, error);
    }
};
exports.createArtist = createArtist;
const updateArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, avatar, biography, country, verified } = req.body;
        const artist = await db_1.prisma.artist.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(avatar !== undefined && { avatar }),
                ...(biography !== undefined && { biography }),
                ...(country !== undefined && { country }),
                ...(verified !== undefined && { verified }),
            },
        });
        return (0, response_1.sendSuccess)(res, artist, 'Artist updated');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to update artist', 500, error);
    }
};
exports.updateArtist = updateArtist;
const deleteArtist = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.artist.delete({ where: { id } });
        return (0, response_1.sendSuccess)(res, null, 'Artist deleted');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to delete artist', 500, error);
    }
};
exports.deleteArtist = deleteArtist;
// --- ALBUM CRUD ---
const createAlbum = async (req, res) => {
    try {
        const { title, artistId, coverUrl, releaseDate, description } = req.body;
        if (!title || !artistId)
            return (0, response_1.sendError)(res, 'Title and artistId are required', 400);
        const album = await db_1.prisma.album.create({
            data: {
                title,
                artistId,
                coverUrl: coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80`,
                releaseDate: releaseDate || new Date().toISOString().split('T')[0],
                description: description || null,
            },
            include: { artist: true },
        });
        return (0, response_1.sendSuccess)(res, album, 'Album created', 201);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to create album', 500, error);
    }
};
exports.createAlbum = createAlbum;
const updateAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, artistId, coverUrl, releaseDate, description } = req.body;
        const album = await db_1.prisma.album.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(artistId && { artistId }),
                ...(coverUrl !== undefined && { coverUrl }),
                ...(releaseDate !== undefined && { releaseDate }),
                ...(description !== undefined && { description }),
            },
            include: { artist: true },
        });
        return (0, response_1.sendSuccess)(res, album, 'Album updated');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to update album', 500, error);
    }
};
exports.updateAlbum = updateAlbum;
const deleteAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.album.delete({ where: { id } });
        return (0, response_1.sendSuccess)(res, null, 'Album deleted');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to delete album', 500, error);
    }
};
exports.deleteAlbum = deleteAlbum;
// --- USER MANAGEMENT ---
const getUsers = async (req, res) => {
    try {
        const { search } = req.query;
        const where = {};
        if (search) {
            where.OR = [
                { username: { contains: String(search) } },
                { email: { contains: String(search) } },
            ];
        }
        const users = await db_1.prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isLocked: true,
                avatar: true,
                createdAt: true,
                _count: { select: { playlists: true, favorites: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return (0, response_1.sendSuccess)(res, users);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch users', 500, error);
    }
};
exports.getUsers = getUsers;
const toggleUserLock = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await db_1.prisma.user.findUnique({ where: { id } });
        if (!user)
            return (0, response_1.sendError)(res, 'User not found', 404);
        if (user.role === 'ADMIN' && req.user?.id === user.id) {
            return (0, response_1.sendError)(res, 'Cannot lock your own admin account', 400);
        }
        const updated = await db_1.prisma.user.update({
            where: { id },
            data: { isLocked: !user.isLocked },
            select: { id: true, username: true, isLocked: true },
        });
        return (0, response_1.sendSuccess)(res, updated, `User ${updated.isLocked ? 'locked' : 'unlocked'}`);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to toggle user lock', 500, error);
    }
};
exports.toggleUserLock = toggleUserLock;
const changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!role || !['USER', 'ADMIN'].includes(role)) {
            return (0, response_1.sendError)(res, 'Valid role (USER or ADMIN) is required', 400);
        }
        const updated = await db_1.prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, username: true, role: true },
        });
        return (0, response_1.sendSuccess)(res, updated, 'User role updated');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to change user role', 500, error);
    }
};
exports.changeUserRole = changeUserRole;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user?.id === id) {
            return (0, response_1.sendError)(res, 'Cannot delete your own admin account', 400);
        }
        await db_1.prisma.user.delete({ where: { id } });
        return (0, response_1.sendSuccess)(res, null, 'User deleted');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to delete user', 500, error);
    }
};
exports.deleteUser = deleteUser;
