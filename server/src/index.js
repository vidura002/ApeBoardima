import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import savedRoutes from './routes/savedRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const defaultClientOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const configuredClientOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const allowedClientOrigins = Array.from(new Set([
  ...defaultClientOrigins,
  ...configuredClientOrigins,
]));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedClientOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/upload', uploadRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`ApeBoardima API  →  http://localhost:${PORT}`);
  console.log(`Health check   →  http://localhost:${PORT}/api/health`);
  console.log(`Environment    →  ${process.env.NODE_ENV || 'development'}`);
});
