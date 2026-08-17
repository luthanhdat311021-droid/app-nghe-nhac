import { Router } from 'express';
import authRoutes from './authRoutes';
import songRoutes from './songRoutes';
import artistRoutes from './artistRoutes';
import albumRoutes from './albumRoutes';
import playlistRoutes from './playlistRoutes';
import favoriteRoutes from './favoriteRoutes';
import historyRoutes from './historyRoutes';
import searchRoutes from './searchRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/songs', songRoutes);
router.use('/artists', artistRoutes);
router.use('/albums', albumRoutes);
router.use('/playlists', playlistRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/history', historyRoutes);
router.use('/search', searchRoutes);
router.use('/admin', adminRoutes);

export default router;
