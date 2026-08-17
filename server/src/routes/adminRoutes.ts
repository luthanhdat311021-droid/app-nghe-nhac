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
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);

// Songs CRUD
router.post('/songs', createSong);
router.put('/songs/:id', updateSong);
router.delete('/songs/:id', deleteSong);

// Artists CRUD
router.post('/artists', createArtist);
router.put('/artists/:id', updateArtist);
router.delete('/artists/:id', deleteArtist);

// Albums CRUD
router.post('/albums', createAlbum);
router.put('/albums/:id', updateAlbum);
router.delete('/albums/:id', deleteAlbum);

// Users Management
router.get('/users', getUsers);
router.put('/users/:id/lock', toggleUserLock);
router.put('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);

export default router;
