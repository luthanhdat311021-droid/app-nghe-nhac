import { Router } from 'express';
import { getSongs, getSongById, incrementPlayCount, getTrendingSongs } from '../controllers/songController';
import { optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuthenticate, getSongs);
router.get('/trending', getTrendingSongs);
router.get('/:id', optionalAuthenticate, getSongById);
router.post('/:id/play', incrementPlayCount);

export default router;
