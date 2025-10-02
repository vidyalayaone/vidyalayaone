import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config';
import schoolRoutes from "./routes/schoolRoutes";
import { errorHandler, notFound } from '@vidyalayaone/common-middleware';
import type { ErrorRequestHandler } from 'express';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
// app.use(cors({
//   origin: config.cors.origin,
//   credentials: true,
//   optionsSuccessStatus: 200,
// }));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow curl/server-side requests

    const allowed = config.cors.origin.some(o => {
      if (o instanceof RegExp) return o.test(origin);
      return o === origin;
    });

    if (allowed) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
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
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CONDITIONAL body parsing - only for POST/PUT/PATCH/DELETE requests
app.use((req, res, next) => {
  console.log(`🔍 [SCHOOL SERVICE] ${req.method} ${req.url}`);
  
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    console.log(`🔍 [SCHOOL SERVICE] Applying body parsing for ${req.method} request`);
    express.json({ limit: '10mb' })(req, res, next);
  } else {
    console.log(`🔍 [SCHOOL SERVICE] Skipping body parsing for ${req.method} request`);
    next();
  }
});

app.use(`${config.server.apiPrefix}/school`, schoolRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'school-service',
    version: '1.0.0',
  });
});

// API routes
app.use(config.server.apiPrefix, schoolRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler as ErrorRequestHandler);

export default app;
