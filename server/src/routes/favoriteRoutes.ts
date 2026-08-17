import { Router } from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  getFavoriteIds,
} from '../controllers/favoriteController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getFavorites);
router.get('/ids', getFavoriteIds);
router.post('/:songId', addFavorite);
router.delete('/:songId', removeFavorite);

export default router;
