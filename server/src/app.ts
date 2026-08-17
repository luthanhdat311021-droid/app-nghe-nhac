import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload files if needed
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', app: 'MusicWave API', version: '1.0.0' });
});

// API Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);
