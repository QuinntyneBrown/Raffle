import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Entry lifecycle integration tests — L2-042 / L2-043
 *
 * Verifies the full state machine:
 *   accepting_entries → drawing_started → (reset) → accepting_entries
 *
 * Uses mocked Prisma to simulate the database layer.
 */

// --- Mock setup ---

const mockRaffleFindFirst = vi.fn();
const mockRaffleFindUnique = vi.fn();
const mockParticipantCreate = vi.fn();
const mockParticipantUpdateMany = vi.fn();

const mockTransaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
  return fn({
    raffle: { findFirst: mockRaffleFindFirst },
    participant: { create: mockParticipantCreate },
  });
});

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    $transaction: mockTransaction,
    raffle: {
      findFirst: mockRaffleFindFirst,
      findUnique: mockRaffleFindUnique,
    },
    participant: {
      updateMany: mockParticipantUpdateMany,
    },
  },
}));

const {
  getActiveRaffle,
  registerParticipant,
  resetDraws,
  EntriesClosedError,
} = await import('../services/raffle.service.js');

// --- Helpers ---

function makeRaffleWithParticipants(
  participants: { name: string; isDrawn: boolean; drawOrder: number | null }[],
) {
  return {
    id: 'raffle-1',
    heading: 'Test Raffle',
    subheading: null,
    theme: 'cosmic',
    animationStyle: 'slot_machine',
    isActive: true,
    participants,
  };
}

// --- Tests ---

describe('Entry Lifecycle State Machine (L2-042 / L2-043)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // L2-042 AC1: No draws → accepting entries
  it('getActiveRaffle returns hasDrawingStarted=false when no draws exist', async () => {
    const raffle = makeRaffleWithParticipants([
      { name: 'Alice', isDrawn: false, drawOrder: null },
      { name: 'Bob', isDrawn: false, drawOrder: null },
    ]);
    mockRaffleFindFirst.mockResolvedValue(raffle);

    const result = await getActiveRaffle();

    expect(result).not.toBeNull();
    expect(result!.hasDrawingStarted).toBe(false);
    expect(result!.totalCount).toBe(2);
    expect(result!.remainingCount).toBe(2);
  });

  // L2-042 AC2: First draw → drawing started
  it('getActiveRaffle returns hasDrawingStarted=true after a draw', async () => {
    const raffle = makeRaffleWithParticipants([
      { name: 'Alice', isDrawn: true, drawOrder: 1 },
      { name: 'Bob', isDrawn: false, drawOrder: null },
    ]);
    mockRaffleFindFirst.mockResolvedValue(raffle);

    const result = await getActiveRaffle();

    expect(result).not.toBeNull();
    expect(result!.hasDrawingStarted).toBe(true);
    expect(result!.totalCount).toBe(2);
    expect(result!.remainingCount).toBe(1);
    expect(result!.drawnNames).toEqual(['Alice']);
  });

  // L2-042 AC3: Stays in drawing started state
  it('getActiveRaffle returns hasDrawingStarted=true when all drawn', async () => {
    const raffle = makeRaffleWithParticipants([
      { name: 'Alice', isDrawn: true, drawOrder: 1 },
      { name: 'Bob', isDrawn: true, drawOrder: 2 },
    ]);
    mockRaffleFindFirst.mockResolvedValue(raffle);

    const result = await getActiveRaffle();

    expect(result!.hasDrawingStarted).toBe(true);
    expect(result!.allDrawn).toBe(true);
    expect(result!.remainingCount).toBe(0);
  });

  // L2-043 AC1: Registration rejected after draw
  it('registerParticipant throws EntriesClosedError when drawing has started', async () => {
    mockRaffleFindFirst.mockResolvedValue({
      id: 'raffle-1',
      isActive: true,
      participants: [{ id: 'p-drawn' }], // drawn participant exists
    });

    await expect(registerParticipant('NewPerson')).rejects.toThrow(EntriesClosedError);
    expect(mockParticipantCreate).not.toHaveBeenCalled();
  });

  // L2-042 AC1 + registration succeeds before draw
  it('registerParticipant succeeds when no draws exist', async () => {
    mockRaffleFindFirst.mockResolvedValue({
      id: 'raffle-1',
      isActive: true,
      participants: [], // no drawn participants
    });
    mockParticipantCreate.mockResolvedValue({
      id: 'p-new',
      raffleId: 'raffle-1',
      name: 'NewPerson',
    });

    const result = await registerParticipant('NewPerson');
    expect(result).toEqual({ name: 'NewPerson' });
  });

  // L2-042 AC4: Reset returns to accepting entries
  it('resetDraws clears isDrawn so entry window reopens', async () => {
    const now = new Date();
    // First call: resetDraws checks raffle exists
    mockRaffleFindUnique.mockResolvedValueOnce({ id: 'raffle-1' });
    mockParticipantUpdateMany.mockResolvedValue({ count: 2 });
    // Second call: getRaffle fetches full raffle for return value
    mockRaffleFindUnique.mockResolvedValueOnce({
      id: 'raffle-1',
      name: 'Test Raffle',
      heading: 'Test',
      subheading: null,
      theme: 'cosmic',
      animationStyle: 'slot_machine',
      isActive: true,
      createdById: 'user-1',
      createdAt: now,
      updatedAt: now,
      participants: [
        { id: 'p1', raffleId: 'raffle-1', name: 'Alice', isDrawn: false, drawnAt: null, drawOrder: null, createdAt: now },
        { id: 'p2', raffleId: 'raffle-1', name: 'Bob', isDrawn: false, drawnAt: null, drawOrder: null, createdAt: now },
      ],
    });

    const result = await resetDraws('raffle-1');

    expect(result).not.toBeNull();
    expect(mockParticipantUpdateMany).toHaveBeenCalledWith({
      where: { raffleId: 'raffle-1' },
      data: { isDrawn: false, drawnAt: null, drawOrder: null },
    });
  });

  // L2-042 AC5: Entry state derived from draw data (no manual toggle)
  it('hasDrawingStarted is purely derived from participant isDrawn data', async () => {
    // Same raffle, different participant states → different hasDrawingStarted
    const noDraws = makeRaffleWithParticipants([
      { name: 'Alice', isDrawn: false, drawOrder: null },
    ]);
    mockRaffleFindFirst.mockResolvedValue(noDraws);
    const r1 = await getActiveRaffle();
    expect(r1!.hasDrawingStarted).toBe(false);

    const withDraw = makeRaffleWithParticipants([
      { name: 'Alice', isDrawn: true, drawOrder: 1 },
    ]);
    mockRaffleFindFirst.mockResolvedValue(withDraw);
    const r2 = await getActiveRaffle();
    expect(r2!.hasDrawingStarted).toBe(true);
  });

  // Null case
  it('getActiveRaffle returns null when no active raffle exists', async () => {
    mockRaffleFindFirst.mockResolvedValue(null);
    const result = await getActiveRaffle();
    expect(result).toBeNull();
  });
});
