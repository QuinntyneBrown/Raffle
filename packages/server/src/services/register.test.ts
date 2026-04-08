import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma } from '@prisma/client';

// Mock prisma before importing the service
const mockFindFirst = vi.fn();
const mockCreate = vi.fn();

const mockTransaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
  return fn({
    raffle: { findFirst: mockFindFirst },
    participant: { create: mockCreate },
  });
});

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    $transaction: mockTransaction,
  },
}));

const { registerParticipant, EntriesClosedError, DuplicateEntryError } = await import(
  '../services/raffle.service.js'
);

describe('registerParticipant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a participant successfully', async () => {
    mockFindFirst.mockResolvedValue({
      id: 'raffle-1',
      isActive: true,
      participants: [], // no drawn participants → entry window open
    });
    mockCreate.mockResolvedValue({
      id: 'p-1',
      raffleId: 'raffle-1',
      name: 'Alice',
    });

    const result = await registerParticipant('Alice');

    expect(result).toEqual({ name: 'Alice' });
    expect(mockCreate).toHaveBeenCalledWith({
      data: { raffleId: 'raffle-1', name: 'Alice' },
    });
  });

  it('throws when no active raffle exists', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(registerParticipant('Bob')).rejects.toThrow(
      'No active raffle found',
    );
  });

  it('throws EntriesClosedError when drawing has started', async () => {
    mockFindFirst.mockResolvedValue({
      id: 'raffle-1',
      isActive: true,
      participants: [{ id: 'p-drawn' }], // has drawn participant
    });

    await expect(registerParticipant('Charlie')).rejects.toThrow(
      EntriesClosedError,
    );
  });

  it('throws DuplicateEntryError on unique constraint violation', async () => {
    mockFindFirst.mockResolvedValue({
      id: 'raffle-1',
      isActive: true,
      participants: [],
    });

    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '5.0.0' },
    );
    mockCreate.mockRejectedValue(prismaError);

    await expect(registerParticipant('Alice')).rejects.toThrow(
      DuplicateEntryError,
    );
  });

  it('sanitizes HTML tags from names', async () => {
    mockFindFirst.mockResolvedValue({
      id: 'raffle-1',
      isActive: true,
      participants: [],
    });
    mockCreate.mockResolvedValue({
      id: 'p-2',
      raffleId: 'raffle-1',
      name: 'Alice',
    });

    await registerParticipant('<script>alert("xss")</script>Alice');

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        raffleId: 'raffle-1',
        name: 'alert("xss")Alice',
      },
    });
  });

  it('trims whitespace from names', async () => {
    mockFindFirst.mockResolvedValue({
      id: 'raffle-1',
      isActive: true,
      participants: [],
    });
    mockCreate.mockResolvedValue({
      id: 'p-3',
      raffleId: 'raffle-1',
      name: 'Alice',
    });

    await registerParticipant('  Alice  ');

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        raffleId: 'raffle-1',
        name: 'Alice',
      },
    });
  });
});
