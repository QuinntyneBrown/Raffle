import { Router, Request, Response } from 'express';
import { loginSchema } from '@raffle/shared';
import { validate } from '../middleware/validate.js';
import { requireAuth, setSessionCookie, clearSessionCookie } from '../middleware/auth.js';
import { login, createUserSession } from '../services/auth.service.js';
import { loginLimiter } from '../middleware/security.js';

const router = Router();

// POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await login(email, password);
      if (!user) {
        res.status(401).json({
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        });
        return;
      }

      const session = createUserSession(user.id);
      setSessionCookie(res, session);

      res.json({
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Login failed' },
      });
    }
  },
);

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response): void => {
  clearSessionCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get(
  '/me',
  requireAuth,
  (req: Request, res: Response): void => {
    res.json({
      user: req.user,
    });
  },
);

export default router;
