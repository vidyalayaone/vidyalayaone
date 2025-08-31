import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Configure multer for memory storage (we'll upload to cloud storage)
const storage = multer.memoryStorage();

// File filter to restrict file types and sizes
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1, // Only one file at a time
  },
});

export const uploadSingle = upload.single('document') as (req: Request, res: Response, next: NextFunction) => void;

// Middleware wrapper to handle multer errors
export const handleUploadErrors = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: { message: 'File size too large. Maximum size is 10MB' },
        timestamp: new Date().toISOString(),
      });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: { message: 'Too many files. Only one file is allowed' },
        timestamp: new Date().toISOString(),
      });
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        error: { message: 'Unexpected field name. Use "document" as the field name' },
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }

  if (err.message && err.message.includes('File type')) {
    res.status(400).json({
      success: false,
      error: { message: err.message },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Pass other errors to the next error handler
  next(err);
};

export default upload;
