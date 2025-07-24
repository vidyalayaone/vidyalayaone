import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/config';
import { authenticate } from './middleware/authMiddleware';
import HealthCheckService from './services/healthCheck';
import ServiceRegistry from './services/serviceRegistry';
import { createServiceProxy } from './utils/proxyUtils';
import { resolveTenant } from "./middleware/tenantMiddleware";
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

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later.' },
    timestamp: new Date().toISOString(),
  },
});
app.use(limiter);

// Logging middleware
if (config.server.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoints
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    version: '1.0.0',
  });
});

app.get('/health/services', async (req: Request, res: Response) => {
  try {
    const healthStatuses = await HealthCheckService.checkAllServices();
    const allHealthy = healthStatuses.every(status => status.status === 'healthy');
    
    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      data: {
        gateway: 'healthy',
        services: healthStatuses,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Health check failed' },
      timestamp: new Date().toISOString(),
    });
  }
});

// IMPORTANT: Add tenant resolution middleware BEFORE service routing
app.use(resolveTenant);

// Dynamic service registration
const services = ServiceRegistry.getAllServices();

console.log('\n🔧 Registering services:');
services.forEach(service => {
  console.log(`   📍 ${service.name}: ${service.path} (protected: ${service.isProtected})`);
  
  if (service.isProtected) {
    // Protected service - apply auth to all routes
    app.use(service.path, authenticate, createServiceProxy(service));
  } else {
    // Unprotected service - let service handle auth internally
    app.use(service.path, createServiceProxy(service));
  }
});

console.log('🔧 Service registration complete\n');

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler as ErrorRequestHandler);

export default app;
