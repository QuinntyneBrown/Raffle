import { Router, Request, Response } from 'express';
import * as raffleService from '../services/raffle.service.js';
import * as drawService from '../services/draw.service.js';

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

export default router;
