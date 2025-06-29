declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        isVerified: boolean;
        createdAt: Date;
      };
    }
  }
}

export {};
