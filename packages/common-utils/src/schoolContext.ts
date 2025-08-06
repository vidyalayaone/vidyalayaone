import { Request } from 'express';

export function getSchoolContext(req: Request) {

  
  return {
    context: req.headers['x-context'] as 'platform' | 'school',
    subdomain: req.headers['x-subdomain'] as string ?? null,
  };
}
