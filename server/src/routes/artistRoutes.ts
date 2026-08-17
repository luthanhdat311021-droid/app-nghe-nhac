import { Router } from 'express';
import { getArtists, getArtistById, toggleFollowArtist } from '../controllers/artistController';
import { createArtist } from '../controllers/adminController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/', getArtists);
router.post('/', optionalAuthenticate, createArtist);
router.get('/:id', optionalAuthenticate, getArtistById);
router.post('/:id/follow', authenticate, toggleFollowArtist);

export default router;
