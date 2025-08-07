import { z } from 'zod';
import { Response } from 'express';

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: any,
  res: Response
): { success: true; data: T } | { success: false } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    res.status(400).json({
      success: false,
      error: { message: 'Zod input validation failed',
               issues: result.error.issues
      },
      timestamp: new Date().toISOString()
    });
    return { success: false };
  }
  
  return { success: true, data: result.data };
}
