import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import config from '../config/config';

export const createServiceProxy = (target: string, pathRewrite?: Record<string, string>): any => {
  const options: Options = {
    target,
    changeOrigin: true,
    timeout: config.proxy.timeout,
    pathRewrite: pathRewrite || undefined,
    
    // Key fix: Let proxy handle the body parsing
    parseReqBody: false,  // Don't parse request body in proxy
    
    onError: (err, req, res) => {
      console.error(`Proxy error for ${req.url}:`, err.message);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: { message: 'Service temporarily unavailable' },
          timestamp: new Date().toISOString(),
        });
      }
    },
    
    onProxyReq: (proxyReq, req) => {
      console.log(`🔍 Proxying: ${req.method} ${req.originalUrl} -> ${target}${req.url}`);
      
      // Forward user information if available
      if ((req as any).user) {
        proxyReq.setHeader('X-User-Data', JSON.stringify((req as any).user));
      }
    },
  };

  return createProxyMiddleware(options);
};

