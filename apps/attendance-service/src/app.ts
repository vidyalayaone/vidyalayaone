import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config';
import { errorHandler, notFound } from '@vidyalayaone/common-middleware';
import attendanceRoutes from './routes/attendanceRoutes';
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
  console.log(`🔍 [ATTENDANCE SERVICE] ${req.method} ${req.url}`);
  
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    console.log(`🔍 [ATTENDANCE SERVICE] Applying body parsing for ${req.method} request`);
    express.json({ limit: '10mb' })(req, res, (err) => {
      if (err) return next(err);
      express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
    });
  } else {
    console.log(`🔍 [ATTENDANCE SERVICE] Skipping body parsing for ${req.method} request`);
    next();
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'attendance-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Attendance routes
app.use(`${config.server.apiPrefix}/attendance`, attendanceRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler as ErrorRequestHandler);

export default app;
