import { createProxyMiddleware } from 'http-proxy-middleware';
import { ServiceConfig } from '../services/serviceRegistry';

export function createServiceProxy(service: ServiceConfig) {
  return createProxyMiddleware({
    target: service.url,
    changeOrigin: true,
    timeout: service.timeout,
    pathRewrite: (path: string, req: any) => {
      return req.originalUrl;
    },
    on: {
      proxyReq: (proxyReq: any, req: any, res: any) => {
        // Forward user data for protected services
        if (service.isProtected && req.user) {
          proxyReq.setHeader('X-User-Data', JSON.stringify(req.user));
          proxyReq.setHeader('X-Service-Auth', 'gateway');
          proxyReq.setHeader('X-User-ID', req.user.userId);
          proxyReq.setHeader('X-User-Email', req.user.email || '');
        }
        
        // Log proxy request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 Proxying: ${req.method} ${req.originalUrl} → ${service.url}${req.originalUrl}`);
        }
      },
      error: (err: Error, req: any, res: any) => {
        console.error(`❌ ${service.name} proxy error:`, err.message);
        if (!res.headersSent) {
          res.status(503).json({
            success: false,
            error: { 
              message: `${service.name} temporarily unavailable`,
              service: service.name 
            },
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  });
}

// import { createProxyMiddleware } from 'http-proxy-middleware';
// import { ServiceConfig } from '../services/serviceRegistry';
//
// export function createServiceProxy(service: ServiceConfig) {
//   return createProxyMiddleware({
//     target: service.url,
//     changeOrigin: true,
//     timeout: service.timeout,
//     pathRewrite: (path: string, req: any) => {
//       return req.originalUrl;
//     },
//     onProxyReq: (proxyReq: any, req: any) => {
//       // Forward user data for protected services
//       if (service.isProtected && req.user) {
//         proxyReq.setHeader('X-User-Data', JSON.stringify(req.user));
//         proxyReq.setHeader('X-Service-Auth', 'gateway');
//         proxyReq.setHeader('X-User-ID', req.user.userId);
//         proxyReq.setHeader('X-User-Email', req.user.email || '');
//       }
//
//       // Log proxy request in development
//       if (process.env.NODE_ENV === 'development') {
//         console.log(`🔄 Proxying: ${req.method} ${req.originalUrl} → ${service.url}${req.url}`);
//       }
//     },
//     onError: (err: Error, req: any, res: any) => {
//       console.error(`❌ ${service.name} proxy error:`, err.message);
//       if (!res.headersSent) {
//         res.status(503).json({
//           success: false,
//           error: { 
//             message: `${service.name} temporarily unavailable`,
//             service: service.name 
//           },
//           timestamp: new Date().toISOString(),
//         });
//       }
//     },
//   });
// }
