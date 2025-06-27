import { Request, Response, NextFunction } from 'express';
import config from '../config/config';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error in development
  if (config.server.nodeEnv === 'development') {
    console.error('Gateway Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(config.server.nodeEnv === 'development' && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
  });
};
