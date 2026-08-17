import { Router } from 'express';
import {
  getPublicPlaylists,
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from '../controllers/playlistController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/public', getPublicPlaylists);
router.get('/user', authenticate, getUserPlaylists);
router.get('/:id', optionalAuthenticate, getPlaylistById);
router.post('/', authenticate, createPlaylist);
router.put('/:id', authenticate, updatePlaylist);
router.delete('/:id', authenticate, deletePlaylist);
router.post('/:id/songs', authenticate, addSongToPlaylist);
router.delete('/:id/songs/:songId', authenticate, removeSongFromPlaylist);

export default router;
