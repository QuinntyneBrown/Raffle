import { Router, Request, Response } from 'express';
import { createRaffleSchema, updateRaffleSchema } from '@raffle/shared';
import { requireAuth } from '../middleware/auth.js';
import { validateCsrf, generateCsrfToken } from '../middleware/csrf.js';
import { validate } from '../middleware/validate.js';
import * as raffleService from '../services/raffle.service.js';

const router = Router();

// All admin routes require authentication
router.use(requireAuth);

// CSRF validation on state-changing requests
router.use(validateCsrf);

// GET /api/admin/csrf-token
router.get('/csrf-token', (req: Request, res: Response): void => {
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
});

// GET /api/admin/raffles
router.get('/raffles', async (_req: Request, res: Response): Promise<void> => {
  try {
    const raffles = await raffleService.listRaffles();
    res.json({ raffles });
  } catch (error) {
    console.error('List raffles error:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list raffles' },
    });
  }
});

// GET /api/admin/raffles/:id
router.get('/raffles/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const raffle = await raffleService.getRaffle(req.params.id);
    if (!raffle) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Raffle not found' },
      });
      return;
    }
    res.json({ raffle });
  } catch (error) {
    console.error('Get raffle error:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get raffle' },
    });
  }
});

// POST /api/admin/raffles
router.post(
  '/raffles',
  validate(createRaffleSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const raffle = await raffleService.createRaffle(req.body, req.user!.id);
      res.status(201).json({ raffle });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        res.status(409).json({
          error: { code: 'DUPLICATE', message: 'A raffle with that name already exists' },
        });
        return;
      }
      console.error('Create raffle error:', error);
      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create raffle' },
      });
    }
  },
);

// PUT /api/admin/raffles/:id
router.put(
  '/raffles/:id',
  validate(updateRaffleSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const raffle = await raffleService.updateRaffle(req.params.id, req.body);
      if (!raffle) {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Raffle not found' },
        });
        return;
      }
      res.json({ raffle });
    } catch (error: any) {
      if (error?.message === 'Cannot update participants after draws have started') {
        res.status(400).json({
          error: { code: 'DRAWS_STARTED', message: error.message },
        });
        return;
      }
      if (error?.code === 'P2002') {
        res.status(409).json({
          error: { code: 'DUPLICATE', message: 'A raffle with that name already exists' },
        });
        return;
      }
      console.error('Update raffle error:', error);
      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update raffle' },
      });
    }
  },
);

// DELETE /api/admin/raffles/:id
router.delete('/raffles/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await raffleService.deleteRaffle(req.params.id);
    if (!deleted) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Raffle not found' },
      });
      return;
    }
    res.json({ message: 'Raffle deleted successfully' });
  } catch (error) {
    console.error('Delete raffle error:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete raffle' },
    });
  }
});

// POST /api/admin/raffles/:id/reset
router.post('/raffles/:id/reset', async (req: Request, res: Response): Promise<void> => {
  try {
    const raffle = await raffleService.resetDraws(req.params.id);
    if (!raffle) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Raffle not found' },
      });
      return;
    }
    res.json({ raffle });
  } catch (error) {
    console.error('Reset draws error:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to reset draws' },
    });
  }
});

// POST /api/admin/raffles/:id/activate
router.post('/raffles/:id/activate', async (req: Request, res: Response): Promise<void> => {
  try {
    const raffle = await raffleService.activateRaffle(req.params.id);
    if (!raffle) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Raffle not found' },
      });
      return;
    }
    res.json({ raffle });
  } catch (error) {
    console.error('Activate raffle error:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to activate raffle' },
    });
  }
});

// POST /api/admin/raffles/:id/deactivate
router.post('/raffles/:id/deactivate', async (req: Request, res: Response): Promise<void> => {
  try {
    const raffle = await raffleService.deactivateRaffle(req.params.id);
    if (!raffle) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Raffle not found' },
      });
      return;
    }
    res.json({ raffle });
  } catch (error) {
    console.error('Deactivate raffle error:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to deactivate raffle' },
    });
  }
});

export default router;
