"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getDatabaseUrl() {
    const envUrl = process.env.DATABASE_URL;
    if (envUrl && (envUrl.startsWith('postgres://') || envUrl.startsWith('postgresql://'))) {
        return envUrl;
    }
    const candidates = [
        path_1.default.join(process.cwd(), 'server', 'prisma', 'dev.db'),
        path_1.default.join(process.cwd(), 'prisma', 'dev.db'),
        path_1.default.join(__dirname, '..', '..', 'prisma', 'dev.db'),
        path_1.default.join(__dirname, '..', 'prisma', 'dev.db'),
    ];
    let foundPath = '';
    for (const candidate of candidates) {
        if (fs_1.default.existsSync(candidate)) {
            foundPath = candidate;
            break;
        }
    }
    if (process.env.VERCEL) {
        const tmpDbPath = '/tmp/dev.db';
        if (foundPath && !fs_1.default.existsSync(tmpDbPath)) {
            try {
                fs_1.default.copyFileSync(foundPath, tmpDbPath);
            }
            catch (err) {
                console.error('Failed to copy database to /tmp:', err);
            }
        }
        if (fs_1.default.existsSync(tmpDbPath)) {
            return `file:${tmpDbPath}`;
        }
    }
    if (foundPath) {
        return `file:${foundPath}`;
    }
    return envUrl || 'file:./dev.db';
}
exports.prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: getDatabaseUrl(),
        },
    },
});
