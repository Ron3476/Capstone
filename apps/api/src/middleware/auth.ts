import { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@edu-savvy/shared';
import { verifyToken } from '../lib/auth';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    schoolId?: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const token = header.slice(7);
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
}

export async function auditLog(
  userId: string | undefined,
  schoolId: string | undefined,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, unknown>,
  req?: Request
) {
  await prisma.auditLog.create({
    data: {
      userId,
      schoolId,
      action: action as never,
      resource,
      resourceId,
      details: details as never,
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent'],
    },
  });
}
