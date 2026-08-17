import { Router } from 'express';
import { getArtists, getArtistById, toggleFollowArtist } from '../controllers/artistController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/', getArtists);
router.get('/:id', optionalAuthenticate, getArtistById);
router.post('/:id/follow', authenticate, toggleFollowArtist);

export default router;
