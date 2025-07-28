import { Response } from 'express';
import { z } from 'zod';

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: any,
  res: Response
): { success: true; data: T } | { success: false } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: formattedErrors,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid input data' },
        timestamp: new Date().toISOString(),
      });
    }
    return { success: false };
  }
}
