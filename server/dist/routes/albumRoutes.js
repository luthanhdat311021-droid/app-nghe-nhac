"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const albumController_1 = require("../controllers/albumController");
const router = (0, express_1.Router)();
router.get('/', albumController_1.getAlbums);
router.get('/:id', albumController_1.getAlbumById);
exports.default = router;
