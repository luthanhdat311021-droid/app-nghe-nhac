"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
exports.app = (0, express_1.default)();
// Middlewares
exports.app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
}));
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
// Serve static upload files if needed
exports.app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health Check
exports.app.get('/health', (_req, res) => {
    res.json({ status: 'OK', app: 'MusicWave API', version: '1.0.0' });
});
// API Routes
exports.app.use('/api', routes_1.default);
// Global Error Handler
exports.app.use(errorHandler_1.errorHandler);
