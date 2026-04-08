import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { helmetMiddleware, corsMiddleware, generalLimiter } from './middleware/security.js';
import authRoutes from './routes/auth.routes.js';
import raffleRoutes from './routes/raffle.routes.js';
import publicRoutes from './routes/public.routes.js';

const app = express();

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Cookie parser with signing secret
app.use(cookieParser(config.sessionSecret));

// Security middleware
app.use(corsMiddleware);
app.use(helmetMiddleware);

// General rate limiting
app.use(generalLimiter);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', raffleRoutes);
app.use('/api/public', publicRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', {
    name: err.name,
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

export default app;
