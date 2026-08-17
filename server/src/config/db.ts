import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && (envUrl.startsWith('postgres://') || envUrl.startsWith('postgresql://'))) {
    return envUrl;
  }

  const candidates = [
    path.join(process.cwd(), 'server', 'prisma', 'dev.db'),
    path.join(process.cwd(), 'prisma', 'dev.db'),
    path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
    path.join(__dirname, '..', 'prisma', 'dev.db'),
  ];

  let foundPath = '';
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      foundPath = candidate;
      break;
    }
  }

  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    if (foundPath && !fs.existsSync(tmpDbPath)) {
      try {
        fs.copyFileSync(foundPath, tmpDbPath);
      } catch (err) {
        console.error('Failed to copy database to /tmp:', err);
      }
    }
    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  if (foundPath) {
    return `file:${foundPath}`;
  }

  return envUrl || 'file:./dev.db';
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
});
