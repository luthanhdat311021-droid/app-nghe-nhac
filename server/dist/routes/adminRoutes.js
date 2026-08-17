"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Protect all admin routes
router.use(auth_1.authenticate, auth_1.requireAdmin);
router.get('/stats', adminController_1.getAdminStats);
// Songs CRUD
router.post('/songs', adminController_1.createSong);
router.put('/songs/:id', adminController_1.updateSong);
router.delete('/songs/:id', adminController_1.deleteSong);
// Artists CRUD
router.post('/artists', adminController_1.createArtist);
router.put('/artists/:id', adminController_1.updateArtist);
router.delete('/artists/:id', adminController_1.deleteArtist);
// Albums CRUD
router.post('/albums', adminController_1.createAlbum);
router.put('/albums/:id', adminController_1.updateAlbum);
router.delete('/albums/:id', adminController_1.deleteAlbum);
// Users Management
router.get('/users', adminController_1.getUsers);
router.put('/users/:id/lock', adminController_1.toggleUserLock);
router.put('/users/:id/role', adminController_1.changeUserRole);
router.delete('/users/:id', adminController_1.deleteUser);
exports.default = router;
