import { Router } from 'express';
import { getHistory, recordHistory, clearHistory } from '../controllers/historyController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getHistory);
router.post('/', optionalAuthenticate, recordHistory);
router.delete('/', authenticate, clearHistory);

export default router;
