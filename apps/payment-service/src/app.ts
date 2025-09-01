import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config';
import paymentRoutes from './routes/paymentRoutes';
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

// Request ID + service auth (defense-in-depth) middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = req.header('X-Request-ID') || crypto.randomUUID?.() || Math.random().toString(36).slice(2);
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Optional defense-in-depth: ensure internal calls come via gateway for protected endpoints
  // Webhook is excluded (Razorpay won't send X-Service-Auth)
  const isWebhook = req.path.includes('/payments/webhook');
  if (!isWebhook && req.path.includes('/payments') && ['POST','PUT','PATCH','DELETE','GET'].includes(req.method)) {
    const svcAuth = req.header('X-Service-Auth');
    if (!svcAuth || svcAuth !== 'gateway') {
      // We still allow if explicitly disabled via env flag in future; for now just log warning
      console.warn(`[PAYMENT SERVICE][${requestId}] Missing or invalid X-Service-Auth for ${req.method} ${req.path}`);
    }
  }
  next();
});

// Webhook route needs raw body for signature verification BEFORE any JSON parsing
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), (req, _res, next) => {
  (req as any).rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body;
  next();
});

// Body parsing middleware for other routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const rid = (req as any).requestId;
  console.log(`🔍 [PAYMENT SERVICE][${rid}] ${req.method} ${req.url}`);
  
  // Skip body parsing for webhook route as it's already handled above
  if (req.url.includes('/webhook')) {
  console.log(`🔍 [PAYMENT SERVICE][${rid}] Skipping body parsing for webhook`);
    return next();
  }
  
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
  console.log(`🔍 [PAYMENT SERVICE][${rid}] Applying body parsing for ${req.method} request`);
    express.json({ limit: '10mb' })(req, res, next);
  } else {
  console.log(`🔍 [PAYMENT SERVICE][${rid}] Skipping body parsing for ${req.method} request`);
    next();
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'payment-service',
    version: '1.0.0',
  });
});

// API routes
app.use(`${config.server.apiPrefix}/payments`, paymentRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler as ErrorRequestHandler);

export default app;
