declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        tenantId?: string | null;
        email: string;
        isVerified: boolean;
        createdAt: Date;
      };
    }
  }
}

export {};
