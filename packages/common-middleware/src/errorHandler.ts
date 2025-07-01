import { Request, Response, NextFunction } from 'express';
import { ErrorRequestHandler } from 'express';
import { AppError } from './types'; // We'll create this next

export const errorHandler: ErrorRequestHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Use environment variable directly
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (nodeEnv === 'development') {
    console.error('Service Error:', {
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
      ...(nodeEnv === 'development' && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
  });
};
