"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Songs CRUD - Open to all users
router.post('/songs', auth_1.optionalAuthenticate, adminController_1.createSong);
router.put('/songs/:id', auth_1.optionalAuthenticate, adminController_1.updateSong);
router.delete('/songs/:id', auth_1.optionalAuthenticate, adminController_1.deleteSong);
// Artists CRUD - Open to all users
router.post('/artists', auth_1.optionalAuthenticate, adminController_1.createArtist);
router.put('/artists/:id', auth_1.optionalAuthenticate, adminController_1.updateArtist);
router.delete('/artists/:id', auth_1.optionalAuthenticate, adminController_1.deleteArtist);
// Albums CRUD - Open to all users
router.post('/albums', auth_1.optionalAuthenticate, adminController_1.createAlbum);
router.put('/albums/:id', auth_1.optionalAuthenticate, adminController_1.updateAlbum);
router.delete('/albums/:id', auth_1.optionalAuthenticate, adminController_1.deleteAlbum);
// Admin-Only Routes
router.get('/stats', auth_1.authenticate, auth_1.requireAdmin, adminController_1.getAdminStats);
router.get('/users', auth_1.authenticate, auth_1.requireAdmin, adminController_1.getUsers);
router.put('/users/:id/lock', auth_1.authenticate, auth_1.requireAdmin, adminController_1.toggleUserLock);
router.put('/users/:id/role', auth_1.authenticate, auth_1.requireAdmin, adminController_1.changeUserRole);
router.delete('/users/:id', auth_1.authenticate, auth_1.requireAdmin, adminController_1.deleteUser);
exports.default = router;
