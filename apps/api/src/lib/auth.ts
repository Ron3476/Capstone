import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { JwtPayload } from '@edu-savvy/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload as any, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function signRefreshToken(payload: Pick<JwtPayload, 'userId'>): string {
  return jwt.sign(payload as any, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as any });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
