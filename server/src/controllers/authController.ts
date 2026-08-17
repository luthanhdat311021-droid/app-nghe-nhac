import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { generateToken } from '../utils/jwt';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return sendError(res, 'Username, email and password are required', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      return sendError(res, 'Email or Username is already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
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

    const token = generateToken({ userId: user.id, role: user.role });

    return sendSuccess(
      res,
      { user, token },
      'Registration successful',
      201
    );
  } catch (error) {
    return sendError(res, 'Failed to register user', 500, error);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { emailOrUsername, email, username, password } = req.body;
    const identifier = (emailOrUsername || email || username || '').trim();

    if (!identifier || !password) {
      return sendError(res, 'Email/Username and password are required', 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { username: identifier.toLowerCase() },
        ],
      },
    });

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (user.isLocked) {
      return sendError(res, 'Your account has been locked. Please contact support.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = generateToken({ userId: user.id, role: user.role });

    const userWithoutPass = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
    };

    return sendSuccess(
      res,
      { user: userWithoutPass, token },
      'Login successful'
    );
  } catch (error) {
    return sendError(res, 'Failed to log in', 500, error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
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

    return sendSuccess(res, user);
  } catch (error) {
    return sendError(res, 'Failed to fetch user profile', 500, error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);

    const { username, avatar, bio } = req.body;

    const updated = await prisma.user.update({
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

    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update profile', 500, error);
  }
};
