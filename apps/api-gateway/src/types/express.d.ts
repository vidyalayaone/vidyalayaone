// import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        schoolId?: string | null;
        isVerified: boolean;
        createdAt: Date;
      };
    }
  }
}

export {};
