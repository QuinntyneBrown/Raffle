import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { prisma } from '../lib/prisma.js';

const SESSION_COOKIE_NAME = 'raffle_session';
const SESSION_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

export interface SessionData {
  userId: string;
  expiry: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export function createSession(userId: string): SessionData {
  return {
    userId,
    expiry: Date.now() + SESSION_MAX_AGE_MS,
  };
}

export function setSessionCookie(res: Response, session: SessionData): void {
  const encoded = Buffer.from(JSON.stringify(session)).toString('base64');
  res.cookie(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
    signed: true,
    maxAge: SESSION_MAX_AGE_MS,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
    signed: true,
    path: '/',
  });
}

function parseSessionCookie(req: Request): SessionData | null {
  const raw = req.signedCookies?.[SESSION_COOKIE_NAME];
  if (!raw) return null;

  try {
    const decoded = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
    if (
      typeof decoded.userId === 'string' &&
      typeof decoded.expiry === 'number'
    ) {
      return decoded as SessionData;
    }
    return null;
  } catch {
    return null;
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = parseSessionCookie(req);

  if (!session) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
    return;
  }

  if (Date.now() > session.expiry) {
    clearSessionCookie(res);
    res.status(401).json({
      error: { code: 'SESSION_EXPIRED', message: 'Session has expired' },
    });
    return;
  }

  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      clearSessionCookie(res);
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not found' },
      });
      return;
    }

    req.user = user;

    // Refresh session on each authenticated request (sliding window)
    const refreshedSession = createSession(user.id);
    setSessionCookie(res, refreshedSession);

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Authentication check failed' },
    });
  }
}
