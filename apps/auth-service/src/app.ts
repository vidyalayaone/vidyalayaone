import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import authRoutes from './routes/authRoutes';

// Import routes (we'll create these in later steps)
// import authRoutes from './routes/authRoutes';

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

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'auth-service',
    version: '1.0.0',
  });
});

// API routes
// app.use(`${config.server.apiPrefix}/auth`, authRoutes);
app.use(`${config.server.apiPrefix}/auth`, authRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
