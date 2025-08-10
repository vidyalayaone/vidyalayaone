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
import { resolveSchool } from "./middleware/resolveSchool";
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

// IMPORTANT: Add school resolution middleware BEFORE service routing
app.use(resolveSchool);

// Dynamic service registration with route-level protection
const services = ServiceRegistry.getAllServices();

console.log('\n🔧 Registering services:');

services.forEach(service => {
  console.log(`   📍 ${service.name}: ${service.path} (default protected: ${service.isProtected})`);
  
  if (service.routes && service.routes.length > 0) {
    // Handle route-specific authentication
    service.routes.forEach(route => {
      const fullPath = `${service.path}${route.path}`;
      
      if (route.isProtected) {
        console.log(`     🔒 ${route.method || 'ALL'} ${fullPath} - PROTECTED`);
        
        if (route.method) {
          // Apply auth to specific HTTP method
          const method = route.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
          app[method](fullPath, authenticate, createServiceProxy(service));
        } else {
          // Apply auth to all HTTP methods for this path
          app.use(fullPath, authenticate, createServiceProxy(service));
        }
      } else {
        console.log(`     🔓 ${route.method || 'ALL'} ${fullPath} - PUBLIC`);
        
        if (route.method) {
          // No auth for specific HTTP method
          const method = route.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
          app[method](fullPath, createServiceProxy(service));
        } else {
          // No auth for all HTTP methods for this path
          app.use(fullPath, createServiceProxy(service));
        }
      }
    });
    
    // Catch-all for routes not explicitly configured
    // This handles any routes not defined in the routes array
    const catchAllMiddleware = service.isProtected 
      ? [authenticate, createServiceProxy(service)]
      : [createServiceProxy(service)];
    
    app.use(service.path, ...catchAllMiddleware);
    
    console.log(`     ⚡ Catch-all for ${service.path} - ${service.isProtected ? 'PROTECTED' : 'PUBLIC'}`);
    
  } else {
    // Fallback to service-level protection (existing behavior)
    if (service.isProtected) {
      console.log(`     🔒 All routes - PROTECTED`);
      app.use(service.path, authenticate, createServiceProxy(service));
    } else {
      console.log(`     🔓 All routes - PUBLIC`);
      app.use(service.path, createServiceProxy(service));
    }
  }
});

console.log('🔧 Service registration complete\n');

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler as ErrorRequestHandler);

export default app;
