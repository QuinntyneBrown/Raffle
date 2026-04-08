import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { DrawResult } from '@raffle/shared';

type TxClient = Prisma.TransactionClient;

export class NoParticipantsAvailableError extends Error {
  constructor() {
    super('No undrawn participants available');
    this.name = 'NoParticipantsAvailableError';
  }
}

export class RaffleNotFoundError extends Error {
  constructor() {
    super('Raffle not found');
    this.name = 'RaffleNotFoundError';
  }
}

export class RaffleNotActiveError extends Error {
  constructor() {
    super('Raffle is not active');
    this.name = 'RaffleNotActiveError';
  }
}

export async function drawName(raffleId: string): Promise<DrawResult> {
  // Verify raffle exists and is active
  const raffle = await prisma.raffle.findUnique({
    where: { id: raffleId },
  });

  if (!raffle) {
    throw new RaffleNotFoundError();
  }

  if (!raffle.isActive) {
    throw new RaffleNotActiveError();
  }

  // Atomic draw using raw SQL with FOR UPDATE SKIP LOCKED
  // This prevents race conditions when multiple draws happen simultaneously
  const result = await prisma.$transaction(async (tx: TxClient) => {
    // Get the next draw order
    const maxOrderResult = await tx.$queryRaw<
      { max_order: number | null }[]
    >`SELECT MAX(draw_order) as max_order FROM participants WHERE raffle_id = ${raffleId}`;

    const nextOrder = (maxOrderResult[0]?.max_order ?? 0) + 1;

    // Select a random undrawn participant with row-level lock
    const candidates = await tx.$queryRaw<
      { id: string; name: string }[]
    >`SELECT id, name FROM participants
      WHERE raffle_id = ${raffleId} AND is_drawn = false
      ORDER BY RANDOM()
      LIMIT 1
      FOR UPDATE SKIP LOCKED`;

    if (candidates.length === 0) {
      throw new NoParticipantsAvailableError();
    }

    const selected = candidates[0];

    // Update the selected participant
    await tx.$queryRaw`UPDATE participants
      SET is_drawn = true, drawn_at = NOW(), draw_order = ${nextOrder}
      WHERE id = ${selected.id}`;

    return {
      name: selected.name,
      drawOrder: nextOrder,
    };
  });

  return result;
}
