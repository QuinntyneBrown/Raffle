import { Router, Request, Response } from 'express';
import { selfRegistrationSchema } from '@raffle/shared';
import * as raffleService from '../services/raffle.service.js';
import * as drawService from '../services/draw.service.js';
import { registrationLimiter } from '../middleware/security.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// GET /api/public/active-raffle
router.get('/active-raffle', async (_req: Request, res: Response): Promise<void> => {
  try {
    const raffle = await raffleService.getActiveRaffle();
    if (!raffle) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'No active raffle found' },
      });
      return;
    }
    res.json({ raffle });
  } catch (error) {
    console.error('Get active raffle error:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get active raffle' },
    });
  }
});

// POST /api/public/draw
router.post('/draw', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Find the active raffle
    const activeRaffle = await raffleService.getActiveRaffle();
    if (!activeRaffle) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'No active raffle found' },
      });
      return;
    }

    const result = await drawService.drawName(activeRaffle.id);
    res.json({ result });
  } catch (error) {
    if (error instanceof drawService.NoParticipantsAvailableError) {
      res.status(400).json({
        error: {
          code: 'ALL_DRAWN',
          message: 'All participants have already been drawn',
        },
      });
      return;
    }
    if (error instanceof drawService.RaffleNotFoundError) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Raffle not found' },
      });
      return;
    }
    if (error instanceof drawService.RaffleNotActiveError) {
      res.status(400).json({
        error: { code: 'NOT_ACTIVE', message: 'Raffle is not active' },
      });
      return;
    }
    console.error('Draw error:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to draw name' },
    });
  }
});

// POST /api/public/register
router.post(
  '/register',
  registrationLimiter,
  validate(selfRegistrationSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body as { name: string };
      const participant = await raffleService.registerParticipant(name);
      res.status(201).json({ participant });
    } catch (error) {
      if (error instanceof raffleService.EntriesClosedError) {
        res.status(403).json({
          error: { code: 'ENTRIES_CLOSED', message: error.message },
        });
        return;
      }
      if (error instanceof raffleService.DuplicateEntryError) {
        res.status(409).json({
          error: { code: 'DUPLICATE_ENTRY', message: error.message },
        });
        return;
      }
      if (error instanceof Error && error.message === 'No active raffle found') {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'No active raffle found' },
        });
        return;
      }
      console.error('Registration error:', error);
      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to register participant' },
      });
    }
  },
);

export default router;
