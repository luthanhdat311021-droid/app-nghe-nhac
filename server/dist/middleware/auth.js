"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.optionalAuthenticate = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const db_1 = require("../config/db");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.sendError)(res, 'Authentication token required', 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, username: true, role: true, isLocked: true },
        });
        if (!user) {
            return (0, response_1.sendError)(res, 'User no longer exists', 401);
        }
        if (user.isLocked) {
            return (0, response_1.sendError)(res, 'Your account has been locked. Please contact support.', 403);
        }
        req.user = user;
        next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Invalid or expired token', 401, error);
    }
};
exports.authenticate = authenticate;
const optionalAuthenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = (0, jwt_1.verifyToken)(token);
            const user = await db_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, username: true, role: true, isLocked: true },
            });
            if (user && !user.isLocked) {
                req.user = user;
            }
        }
    }
    catch (_e) {
        // Ignore error for optional auth
    }
    next();
};
exports.optionalAuthenticate = optionalAuthenticate;
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return (0, response_1.sendError)(res, 'Access denied: Admin privileges required', 403);
    }
    next();
};
exports.requireAdmin = requireAdmin;
