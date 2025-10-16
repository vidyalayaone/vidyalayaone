import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config';
import profileRoutes from './routes/profileRoutes';
import internalRoutes from './routes/internalRoutes';
import { errorHandler, notFound } from '@vidyalayaone/common-middleware';
import type { ErrorRequestHandler } from 'express';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Logging middleware
if (config.server.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CONDITIONAL body parsing - only for POST/PUT/PATCH/DELETE requests
app.use((req, res, next) => {
  console.log(`🔍 [PROFILE SERVICE] ${req.method} ${req.url}`);
  
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    express.json({ limit: '10mb' })(req, res, (err) => {
      if (err) return next(err);
      express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
    });
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'profile-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes will be added here
app.use(`${config.server.apiPrefix}/profile`, profileRoutes);

// Internal routes for service-to-service communication
app.use(`${config.server.apiPrefix}/internal`, internalRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler as ErrorRequestHandler);

export default app;

