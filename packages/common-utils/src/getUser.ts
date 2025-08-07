import { Request } from 'express';

export function getUser(req: Request) {
  return {
    id: req.headers['x-user-id'] as string ?? null,
    role: req.headers['x-user-role'] as string ?? null,
  };
}
