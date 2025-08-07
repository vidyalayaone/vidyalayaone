import jwt from 'jsonwebtoken';
import config from '../config/config';

export interface JwtPayload {
  id: string;
  role: string;
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

export function verifyRefreshToken(token: string): jwt.JwtPayload | string {
  return jwt.verify(token, config.jwt.refreshSecret);
}
