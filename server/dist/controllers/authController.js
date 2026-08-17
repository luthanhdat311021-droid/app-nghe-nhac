"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return (0, response_1.sendError)(res, 'Username, email and password are required', 400);
        }
        if (password.length < 6) {
            return (0, response_1.sendError)(res, 'Password must be at least 6 characters long', 400);
        }
        const existingUser = await db_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: email.toLowerCase() },
                    { username: username.toLowerCase() },
                ],
            },
        });
        if (existingUser) {
            return (0, response_1.sendError)(res, 'Email or Username is already registered', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: {
                username,
                email: email.toLowerCase(),
                password: hashedPassword,
                avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                avatar: true,
                bio: true,
                createdAt: true,
            },
        });
        const token = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
        return (0, response_1.sendSuccess)(res, { user, token }, 'Registration successful', 201);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to register user', 500, error);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { emailOrUsername, email, username, password } = req.body;
        const identifier = (emailOrUsername || email || username || '').trim();
        if (!identifier || !password) {
            return (0, response_1.sendError)(res, 'Email/Username and password are required', 400);
        }
        const user = await db_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier.toLowerCase() },
                    { username: identifier.toLowerCase() },
                ],
            },
        });
        if (!user) {
            return (0, response_1.sendError)(res, 'Invalid credentials', 401);
        }
        if (user.isLocked) {
            return (0, response_1.sendError)(res, 'Your account has been locked. Please contact support.', 403);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return (0, response_1.sendError)(res, 'Invalid credentials', 401);
        }
        const token = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
        const userWithoutPass = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            createdAt: user.createdAt,
        };
        return (0, response_1.sendSuccess)(res, { user: userWithoutPass, token }, 'Login successful');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to log in', 500, error);
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        }
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                avatar: true,
                bio: true,
                createdAt: true,
                _count: {
                    select: {
                        playlists: true,
                        favorites: true,
                        followers: true,
                    },
                },
            },
        });
        return (0, response_1.sendSuccess)(res, user);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to fetch user profile', 500, error);
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, 'Not authenticated', 401);
        const { username, avatar, bio } = req.body;
        const updated = await db_1.prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(username && { username }),
                ...(avatar !== undefined && { avatar }),
                ...(bio !== undefined && { bio }),
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                avatar: true,
                bio: true,
                createdAt: true,
            },
        });
        return (0, response_1.sendSuccess)(res, updated, 'Profile updated successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Failed to update profile', 500, error);
    }
};
exports.updateProfile = updateProfile;
