import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type {
  RaffleWithCounts,
  CreateRaffleInput,
  UpdateRaffleInput,
  ActiveRafflePublic,
} from '@raffle/shared';

type TxClient = Prisma.TransactionClient;

export class EntriesClosedError extends Error {
  constructor() {
    super('Entries are closed — drawing has already started');
    this.name = 'EntriesClosedError';
  }
}

export class DuplicateEntryError extends Error {
  constructor(name: string) {
    super(`A participant named "${name}" is already registered`);
    this.name = 'DuplicateEntryError';
  }
}

function mapParticipant(p: {
  id: string;
  raffleId: string;
  name: string;
  isDrawn: boolean;
  drawnAt: Date | null;
  drawOrder: number | null;
  createdAt: Date;
}) {
  return {
    id: p.id,
    raffleId: p.raffleId,
    name: p.name,
    isDrawn: p.isDrawn,
    drawnAt: p.drawnAt?.toISOString() ?? null,
    drawOrder: p.drawOrder,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function listRaffles(): Promise<RaffleWithCounts[]> {
  const raffles = await prisma.raffle.findMany({
    include: {
      _count: {
        select: { participants: true },
      },
      participants: {
        where: { isDrawn: true },
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return raffles.map((r) => {
    const totalParticipants = r._count.participants;
    const drawnCount = r.participants.length;
    return {
      id: r.id,
      name: r.name,
      heading: r.heading,
      subheading: r.subheading,
      theme: r.theme as RaffleWithCounts['theme'],
      animationStyle: r.animationStyle as RaffleWithCounts['animationStyle'],
      isActive: r.isActive,
      createdBy: r.createdById,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      totalParticipants,
      drawnCount,
      remainingCount: totalParticipants - drawnCount,
    };
  });
}

export async function getRaffle(id: string) {
  const raffle = await prisma.raffle.findUnique({
    where: { id },
    include: {
      participants: {
        orderBy: [{ drawOrder: 'asc' }, { name: 'asc' }],
      },
    },
  });

  if (!raffle) return null;

  return formatRaffleWithParticipants(raffle);
}

export async function createRaffle(input: CreateRaffleInput, userId: string) {
  const raffle = await prisma.$transaction(async (tx: TxClient) => {
    const created = await tx.raffle.create({
      data: {
        name: input.name,
        heading: input.heading,
        subheading: input.subheading ?? null,
        theme: input.theme,
        animationStyle: input.animationStyle,
        createdById: userId,
        participants: {
          create: input.participants.map((name: string) => ({
            name: name.trim(),
          })),
        },
      },
      include: {
        participants: {
          orderBy: { name: 'asc' },
        },
      },
    });

    return created;
  });

  return formatRaffleWithParticipants(raffle);
}

export async function updateRaffle(id: string, input: UpdateRaffleInput) {
  return prisma.$transaction(async (tx: TxClient) => {
    const existing = await tx.raffle.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!existing) return null;

    const { participants: newParticipants, ...raffleFields } = input;
    const updateData: Record<string, unknown> = {};

    if (raffleFields.name !== undefined) updateData.name = raffleFields.name;
    if (raffleFields.heading !== undefined) updateData.heading = raffleFields.heading;
    if (raffleFields.subheading !== undefined) updateData.subheading = raffleFields.subheading;
    if (raffleFields.theme !== undefined) updateData.theme = raffleFields.theme;
    if (raffleFields.animationStyle !== undefined)
      updateData.animationStyle = raffleFields.animationStyle;

    if (newParticipants !== undefined) {
      const hasDrawnParticipants = existing.participants.some(
        (p: { isDrawn: boolean }) => p.isDrawn,
      );
      if (hasDrawnParticipants) {
        throw new Error('Cannot update participants after draws have started');
      }

      await tx.participant.deleteMany({ where: { raffleId: id } });
      await tx.participant.createMany({
        data: newParticipants.map((name: string) => ({
          raffleId: id,
          name: name.trim(),
        })),
      });
    }

    const updated = await tx.raffle.update({
      where: { id },
      data: updateData,
      include: {
        participants: {
          orderBy: [{ drawOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });

    return formatRaffleWithParticipants(updated);
  });
}

export async function deleteRaffle(id: string): Promise<boolean> {
  const raffle = await prisma.raffle.findUnique({ where: { id } });
  if (!raffle) return false;

  await prisma.raffle.delete({ where: { id } });
  return true;
}

export async function resetDraws(id: string) {
  const raffle = await prisma.raffle.findUnique({ where: { id } });
  if (!raffle) return null;

  await prisma.participant.updateMany({
    where: { raffleId: id },
    data: {
      isDrawn: false,
      drawnAt: null,
      drawOrder: null,
    },
  });

  return getRaffle(id);
}

export async function activateRaffle(id: string) {
  return prisma.$transaction(async (tx: TxClient) => {
    const raffle = await tx.raffle.findUnique({ where: { id } });
    if (!raffle) return null;

    await tx.raffle.updateMany({
      data: { isActive: false },
    });

    const updated = await tx.raffle.update({
      where: { id },
      data: { isActive: true },
      include: {
        participants: {
          orderBy: [{ drawOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });

    return formatRaffleWithParticipants(updated);
  });
}

export async function deactivateRaffle(id: string) {
  const raffle = await prisma.raffle.findUnique({ where: { id } });
  if (!raffle) return null;

  await prisma.raffle.update({
    where: { id },
    data: { isActive: false },
  });

  return getRaffle(id);
}

export async function getActiveRaffle(): Promise<ActiveRafflePublic | null> {
  const raffle = await prisma.raffle.findFirst({
    where: { isActive: true },
    include: {
      participants: {
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!raffle) return null;

  const allDrawn = raffle.participants.every((p: { isDrawn: boolean }) => p.isDrawn);
  const lastDrawn = raffle.participants
    .filter((p: { isDrawn: boolean; drawOrder: number | null }) => p.isDrawn && p.drawOrder !== null)
    .sort(
      (
        a: { drawOrder: number | null },
        b: { drawOrder: number | null },
      ) => (b.drawOrder ?? 0) - (a.drawOrder ?? 0),
    )[0] as { name: string } | undefined;

  const totalCount = raffle.participants.length;
  const remainingCount = raffle.participants.filter((p: { isDrawn: boolean }) => !p.isDrawn).length;

<<<<<<< HEAD
  const hasDrawingStarted = raffle.participants.some((p: { isDrawn: boolean }) => p.isDrawn);
=======
  const drawnParticipants = raffle.participants
    .filter((p: { isDrawn: boolean; drawOrder: number | null }) => p.isDrawn && p.drawOrder !== null)
    .sort(
      (
        a: { drawOrder: number | null },
        b: { drawOrder: number | null },
      ) => (a.drawOrder ?? 0) - (b.drawOrder ?? 0),
    );
>>>>>>> 0cd151a23b122706f576b61798960592a96676df

  return {
    id: raffle.id,
    heading: raffle.heading,
    subheading: raffle.subheading,
    theme: raffle.theme as ActiveRafflePublic['theme'],
    animationStyle: raffle.animationStyle as ActiveRafflePublic['animationStyle'],
    participantNames: raffle.participants.map((p: { name: string }) => p.name),
    allDrawn,
    hasDrawingStarted,
    lastDrawnName: lastDrawn?.name ?? null,
    totalCount,
    remainingCount,
    drawnNames: drawnParticipants.map((p: { name: string }) => p.name),
  };
}

function stripHtmlTags(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

export async function registerParticipant(name: string): Promise<{ name: string }> {
  return prisma.$transaction(async (tx: TxClient) => {
    const raffle = await tx.raffle.findFirst({
      where: { isActive: true },
      include: {
        participants: {
          where: { isDrawn: true },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!raffle) {
      throw new Error('No active raffle found');
    }

    if (raffle.participants.length > 0) {
      throw new EntriesClosedError();
    }

    const sanitizedName = stripHtmlTags(name.trim());

    try {
      const participant = await tx.participant.create({
        data: {
          raffleId: raffle.id,
          name: sanitizedName,
        },
      });
      return { name: participant.name };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new DuplicateEntryError(sanitizedName);
      }
      throw error;
    }
  });
}

function formatRaffleWithParticipants(raffle: {
  id: string;
  name: string;
  heading: string;
  subheading: string | null;
  theme: string;
  animationStyle: string;
  isActive: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  participants: {
    id: string;
    raffleId: string;
    name: string;
    isDrawn: boolean;
    drawnAt: Date | null;
    drawOrder: number | null;
    createdAt: Date;
  }[];
}) {
  const totalParticipants = raffle.participants.length;
  const drawnCount = raffle.participants.filter((p) => p.isDrawn).length;

  return {
    id: raffle.id,
    name: raffle.name,
    heading: raffle.heading,
    subheading: raffle.subheading,
    theme: raffle.theme,
    animationStyle: raffle.animationStyle,
    isActive: raffle.isActive,
    createdBy: raffle.createdById,
    createdAt: raffle.createdAt.toISOString(),
    updatedAt: raffle.updatedAt.toISOString(),
    totalParticipants,
    drawnCount,
    remainingCount: totalParticipants - drawnCount,
    participants: raffle.participants.map(mapParticipant),
  };
}
