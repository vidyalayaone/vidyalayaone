import { Request } from 'express';

export function getUser(req: Request) {
  return {
    id: req.headers['x-user-id'] as string ?? null,
    roleId: req.headers['x-user-role-id'] as string ?? null,
    roleName: req.headers['x-user-role-name'] as string ?? null,
  };
}
