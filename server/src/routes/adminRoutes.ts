import { Router } from 'express';
import {
  getAdminStats,
  createSong,
  updateSong,
  deleteSong,
  createArtist,
  updateArtist,
  deleteArtist,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getUsers,
  toggleUserLock,
  changeUserRole,
  deleteUser,
} from '../controllers/adminController';
import { authenticate, optionalAuthenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Songs CRUD - Open to all users
router.post('/songs', optionalAuthenticate, createSong);
router.put('/songs/:id', optionalAuthenticate, updateSong);
router.delete('/songs/:id', optionalAuthenticate, deleteSong);

// Artists CRUD - Open to all users
router.post('/artists', optionalAuthenticate, createArtist);
router.put('/artists/:id', optionalAuthenticate, updateArtist);
router.delete('/artists/:id', optionalAuthenticate, deleteArtist);

// Albums CRUD - Open to all users
router.post('/albums', optionalAuthenticate, createAlbum);
router.put('/albums/:id', optionalAuthenticate, updateAlbum);
router.delete('/albums/:id', optionalAuthenticate, deleteAlbum);

// Admin-Only Routes
router.get('/stats', authenticate, requireAdmin, getAdminStats);
router.get('/users', authenticate, requireAdmin, getUsers);
router.put('/users/:id/lock', authenticate, requireAdmin, toggleUserLock);
router.put('/users/:id/role', authenticate, requireAdmin, changeUserRole);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);

export default router;
