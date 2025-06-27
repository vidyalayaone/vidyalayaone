import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { authenticate } from './middleware/authMiddleware';
import HealthCheckService from './services/healthCheck';
import { createProxyMiddleware } from 'http-proxy-middleware';

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

// GLOBAL DEBUG MIDDLEWARE - Add this to see ALL requests
app.use((req, res, next) => {
  console.log('\n=== INCOMING REQUEST ===');
  console.log(`🔍 Method: ${req.method}`);
  console.log(`🔍 Original URL: ${req.originalUrl}`);
  console.log(`🔍 URL: ${req.url}`);
  console.log(`🔍 Path: ${req.path}`);
  console.log(`🔍 Base URL: ${req.baseUrl}`);
  console.log(`🔍 Headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`🔍 Body:`, req.body);
  console.log('========================\n');
  next();
});

// Health check endpoints
app.get('/health', (req: Request, res: Response) => {
  console.log('🏥 Health check endpoint hit');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    version: '1.0.0',
  });
});

app.get('/health/services', async (req: Request, res: Response) => {
  console.log('🏥 Services health check endpoint hit');
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

// DEBUG MIDDLEWARE for auth routes
app.use('/api/v1/auth', (req, res, next) => {
  console.log('\n=== AUTH ROUTE MATCHED ===');
  console.log(`🔍 Auth route - Method: ${req.method}`);
  console.log(`🔍 Auth route - Original URL: ${req.originalUrl}`);
  console.log(`🔍 Auth route - URL: ${req.url}`);
  console.log(`🔍 Auth route - Path: ${req.path}`);
  console.log(`🔍 Auth route - Base URL: ${req.baseUrl}`);
  console.log(`🔍 Target service: ${config.services.auth.url}`);
  console.log(`🔍 Will proxy to: ${config.services.auth.url}${req.url}`);
  console.log('==========================\n');
  next();
});

// PUBLIC ROUTES - Fix the proxy to use originalUrl
app.use(
  '/api/v1/auth',
  createProxyMiddleware({
    target: config.services.auth.url,
    changeOrigin: true,
    logLevel: 'debug',
    // Add this router function to use originalUrl
    router: (req) => {
      console.log(`🔧 Router function - originalUrl: ${req.originalUrl}`);
      return config.services.auth.url;
    },
    pathRewrite: (path, req) => {
      console.log(`🔧 PathRewrite - input path: ${path}`);
      console.log(`🔧 PathRewrite - originalUrl: ${req.originalUrl}`);
      const newPath = req.originalUrl; // Use the full original URL
      console.log(`🔧 PathRewrite - output path: ${newPath}`);
      return newPath;
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log('\n=== PROXY REQUEST ===');
      console.log(`🚀 Proxy Method: ${proxyReq.method}`);
      console.log(`🚀 Proxy Path: ${proxyReq.path}`);
      console.log(`🚀 Proxy Host: ${proxyReq.getHeader('host')}`);
      console.log(`🚀 Original req.url: ${req.url}`);
      console.log(`🚀 Original req.originalUrl: ${req.originalUrl}`);
      console.log(`🚀 Target: ${config.services.auth.url}`);
      console.log(`🚀 Final URL: ${config.services.auth.url}${req.originalUrl}`);
      console.log('=====================\n');
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('\n=== PROXY RESPONSE ===');
      console.log(`📥 Response Status: ${proxyRes.statusCode}`);
      console.log('======================\n');
    },
    onError: (err, req, res) => {
      console.error('\n=== PROXY ERROR ===');
      console.error('❌ Proxy error:', err.message);
      console.error('❌ Request URL:', req.url);
      console.error('❌ Request method:', req.method);
      console.error('===================\n');
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: { message: 'Service temporarily unavailable' },
          timestamp: new Date().toISOString(),
        });
      }
    },
  })
);

// // PUBLIC ROUTES - Direct proxy configuration
// app.use(
//   '/api/v1/auth',
//   createProxyMiddleware({
//     target: config.services.auth.url,
//     changeOrigin: true,
//     logLevel: 'debug',
//     onProxyReq: (proxyReq, req, res) => {
//       console.log('\n=== PROXY REQUEST ===');
//       console.log(`🚀 Proxy Method: ${proxyReq.method}`);
//       console.log(`🚀 Proxy Path: ${proxyReq.path}`);
//       console.log(`🚀 Proxy Host: ${proxyReq.getHeader('host')}`);
//       console.log(`🚀 Original req.url: ${req.url}`);
//       console.log(`🚀 Original req.originalUrl: ${req.originalUrl}`);
//       console.log(`🚀 Target: ${config.services.auth.url}`);
//       console.log(`🚀 Final URL: ${config.services.auth.url}${req.url}`);
//       console.log('=====================\n');
//     },
//     onProxyRes: (proxyRes, req, res) => {
//       console.log('\n=== PROXY RESPONSE ===');
//       console.log(`📥 Response Status: ${proxyRes.statusCode}`);
//       console.log(`📥 Response Headers:`, proxyRes.headers);
//       console.log('======================\n');
//     },
//     onError: (err, req, res) => {
//       console.error('\n=== PROXY ERROR ===');
//       console.error('❌ Proxy error:', err.message);
//       console.error('❌ Request URL:', req.url);
//       console.error('❌ Request method:', req.method);
//       console.error('===================\n');
//       if (!res.headersSent) {
//         res.status(503).json({
//           success: false,
//           error: { message: 'Service temporarily unavailable' },
//           timestamp: new Date().toISOString(),
//         });
//       }
//     },
//   })
// );

// DEBUG MIDDLEWARE for protected routes
app.use('/api/v1/protected', (req, res, next) => {
  console.log('\n=== PROTECTED ROUTE MATCHED ===');
  console.log(`🔒 Protected route - Method: ${req.method}`);
  console.log(`🔒 Protected route - Original URL: ${req.originalUrl}`);
  console.log(`🔒 Protected route - URL: ${req.url}`);
  console.log(`🔒 Protected route - Path: ${req.path}`);
  console.log('===============================\n');
  next();
});

// PROTECTED ROUTES
app.use('/api/v1/protected', express.json({ limit: '10mb' }), authenticate);
app.use(
  '/api/v1/protected',
  createProxyMiddleware({
    target: config.services.auth.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/protected': '/api/v1/auth',
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      console.log('\n=== PROTECTED PROXY REQUEST ===');
      console.log(`🔒🚀 Protected Proxy Method: ${proxyReq.method}`);
      console.log(`🔒🚀 Protected Proxy Path: ${proxyReq.path}`);
      console.log(`🔒🚀 Original req.url: ${req.url}`);
      console.log(`🔒🚀 Original req.originalUrl: ${req.originalUrl}`);
      console.log('===============================\n');
      
      // Forward user information
      if ((req as any).user) {
        proxyReq.setHeader('X-User-Data', JSON.stringify((req as any).user));
      }
    },
  })
);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;

// import express, { Application, Request, Response } from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import rateLimit from 'express-rate-limit';
// import config from './config/config';
// import { errorHandler } from './middleware/errorHandler';
// import { notFound } from './middleware/notFound';
// import { authenticate } from './middleware/authMiddleware';
// import { createServiceProxy } from './middleware/proxyMiddleware';
// import HealthCheckService from './services/healthCheck';
// import { createProxyMiddleware } from 'http-proxy-middleware';
//
// const app: Application = express();
//
// // Security middleware
// app.use(helmet());
//
// // CORS configuration
// app.use(cors({
//   origin: config.cors.origin,
//   credentials: true,
//   optionsSuccessStatus: 200,
// }));
//
// // Rate limiting
// const limiter = rateLimit({
//   windowMs: config.rateLimit.windowMs,
//   max: config.rateLimit.max,
//   message: {
//     success: false,
//     error: { message: 'Too many requests, please try again later.' },
//     timestamp: new Date().toISOString(),
//   },
// });
// app.use(limiter);
//
// // Logging middleware
// if (config.server.nodeEnv === 'development') {
//   app.use(morgan('dev'));
// } else {
//   app.use(morgan('combined'));
// }
//
// // Health check endpoints (these need body parsing)
// app.get('/health', express.json(), (req: Request, res: Response) => {
//   res.status(200).json({
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     service: 'api-gateway',
//     version: '1.0.0',
//   });
// });
//
// app.get('/health/services', express.json(), async (req: Request, res: Response) => {
//   try {
//     const healthStatuses = await HealthCheckService.checkAllServices();
//     const allHealthy = healthStatuses.every(status => status.status === 'healthy');
//
//     res.status(allHealthy ? 200 : 503).json({
//       success: allHealthy,
//       data: {
//         gateway: 'healthy',
//         services: healthStatuses,
//       },
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: { message: 'Health check failed' },
//       timestamp: new Date().toISOString(),
//     });
//   }
// });
//
// // PUBLIC ROUTES - Direct proxy configuration
// app.use(
//   '/api/v1/auth',
//   createProxyMiddleware({
//     target: config.services.auth.url,
//     changeOrigin: true,
//     logLevel: 'debug', // Enable debug logging
//     onProxyReq: (proxyReq, req, res) => {
//       console.log(`🔍 Proxying: ${req.method} ${req.originalUrl}`);
//     },
//     onError: (err, req, res) => {
//       console.error('Proxy error:', err.message);
//       if (!res.headersSent) {
//         res.status(503).json({
//           success: false,
//           error: { message: 'Service temporarily unavailable' },
//           timestamp: new Date().toISOString(),
//         });
//       }
//     },
//   })
// );
//
// // PROTECTED ROUTES
// app.use('/api/v1/protected', express.json({ limit: '10mb' }), authenticate);
// app.use(
//   '/api/v1/protected',
//   createProxyMiddleware({
//     target: config.services.auth.url,
//     changeOrigin: true,
//     pathRewrite: {
//       '^/api/v1/protected': '/api/v1/auth',
//     },
//     onProxyReq: (proxyReq, req, res) => {
//       // Forward user information
//       if ((req as any).user) {
//         proxyReq.setHeader('X-User-Data', JSON.stringify((req as any).user));
//       }
//     },
//   })
// );
//
// // 404 handler
// app.use(notFound);
//
// // Global error handler
// app.use(errorHandler);
//
// export default app;
