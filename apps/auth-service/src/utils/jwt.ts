import jwt from 'jsonwebtoken';
import config from '../config/config';

export interface JwtPayload {
  userId: string;
  role: string;         // <-- add this line
  tenantId: string | null; // <-- add this line (or just string if never null)
}

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(
    payload,
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn } as jwt.SignOptions
  );
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(
    payload,
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
  );
}

// export function verifyAccessToken(token: string): jwt.JwtPayload | string {
//   return jwt.verify(token, config.jwt.accessSecret);
// }

export function verifyRefreshToken(token: string): jwt.JwtPayload | string {
  return jwt.verify(token, config.jwt.refreshSecret);
}
