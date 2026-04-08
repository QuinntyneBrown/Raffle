import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';

const CSRF_COOKIE_NAME = 'raffle_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

export function generateCsrfToken(req: Request, res: Response): string {
  const token = uuidv4();

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
    signed: true,
    maxAge: 30 * 60 * 1000, // 30 minutes
    path: '/',
  });

  return token;
}

export function validateCsrf(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const cookieToken = req.signedCookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string | undefined;

  if (!cookieToken || !headerToken) {
    res.status(403).json({
      error: { code: 'CSRF_MISSING', message: 'CSRF token missing' },
    });
    return;
  }

  if (cookieToken !== headerToken) {
    res.status(403).json({
      error: { code: 'CSRF_INVALID', message: 'CSRF token invalid' },
    });
    return;
  }

  next();
}
