import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config';
import teacherRoutes from './routes/teacherRoutes';
import studentRoutes from './routes/studentRoutes';
import profileRoutes from './routes/profileRoutes';
import { errorHandler, notFound } from '@vidyalayaone/common-middleware';
import type { ErrorRequestHandler } from 'express';
import DatabaseService from './services/database';

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
app.get('/health', async (req: Request, res: Response) => {
  try {
    const dbHealth = await DatabaseService.healthCheck();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'profile-service',
      version: '1.0.0',
      database: dbHealth ? 'connected' : 'disconnected',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Health check failed' },
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use(`${config.server.apiPrefix}/teachers`, teacherRoutes);
app.use(`${config.server.apiPrefix}/students`, studentRoutes);
app.use(`${config.server.apiPrefix}/profile`, profileRoutes);

// Utility routes
app.get(`${config.server.apiPrefix}/subjects`, (req: Request, res: Response) => {
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi',
    'Social Science', 'Computer Science', 'Physical Education', 'Arts',
    'History', 'Geography', 'Economics', 'Political Science', 'Philosophy',
    'Psychology', 'Literature', 'Music', 'Dance', 'Fine Arts'
  ];

  res.status(200).json({
    success: true,
    data: subjects,
    timestamp: new Date().toISOString()
  });
});

app.get(`${config.server.apiPrefix}/classes`, (req: Request, res: Response) => {
  const classes = Array.from({ length: 12 }, (_, i) => i + 1);

  res.status(200).json({
    success: true,
    data: classes,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler as ErrorRequestHandler);

export default app;
