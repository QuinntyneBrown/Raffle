import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.participant.deleteMany();
  await prisma.raffle.deleteMany();
  await prisma.adminUser.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@raffle.app',
      password: hashedPassword,
    },
  });

  console.log('Seeded admin user:', admin.email);

  // Raffle 1 — Active, festive theme, slot machine animation
  const raffle1 = await prisma.raffle.create({
    data: {
      name: 'Holiday Party Raffle',
      heading: 'HOLIDAY PARTY PRIZE DRAW',
      subheading: 'Who will win the grand prize?',
      theme: 'festive',
      animationStyle: 'slot_machine',
      isActive: true,
      createdById: admin.id,
      participants: {
        create: [
          'Alice Johnson',
          'Bob Smith',
          'Charlie Brown',
          'Diana Prince',
          'Edward Norton',
          'Fiona Apple',
          'George Lucas',
          'Hannah Montana',
          'Ivan Drago',
          'Julia Roberts',
        ].map((name) => ({ name })),
      },
    },
    include: { participants: true },
  });

  console.log(
    `Seeded raffle: "${raffle1.name}" with ${raffle1.participants.length} participants (ACTIVE)`,
  );

  // Raffle 2 — Inactive, cosmic theme, wheel spin
  const raffle2 = await prisma.raffle.create({
    data: {
      name: 'Team Building Lottery',
      heading: 'TEAM BUILDING LOTTERY',
      subheading: 'Spin the wheel of fortune!',
      theme: 'cosmic',
      animationStyle: 'wheel_spin',
      isActive: false,
      createdById: admin.id,
      participants: {
        create: [
          'Sarah Connor',
          'John Doe',
          'Jane Smith',
          'Michael Scott',
          'Pam Beesly',
          'Jim Halpert',
          'Dwight Schrute',
          'Ryan Howard',
          'Kelly Kapoor',
          'Stanley Hudson',
          'Angela Martin',
          'Oscar Martinez',
        ].map((name) => ({ name })),
      },
    },
    include: { participants: true },
  });

  console.log(
    `Seeded raffle: "${raffle2.name}" with ${raffle2.participants.length} participants`,
  );

  // Raffle 3 — Inactive, corporate theme, card flip, some names already drawn
  const raffle3 = await prisma.raffle.create({
    data: {
      name: 'Q4 Prize Draw',
      heading: 'Q4 ALL-HANDS PRIZE DRAW',
      subheading: null,
      theme: 'corporate',
      animationStyle: 'card_flip',
      isActive: false,
      createdById: admin.id,
      participants: {
        create: [
          'Emma Williams',
          'James Chen',
          'Maria Garcia',
          'David Kim',
          'Lisa Patel',
          'Tom Anderson',
          'Sarah Johnson',
          'Alex Rivera',
        ].map((name) => ({ name })),
      },
    },
    include: { participants: true },
  });

  // Mark a few as drawn to simulate a partially-completed raffle
  const drawnNames = ['Emma Williams', 'James Chen', 'Maria Garcia'];
  for (let i = 0; i < drawnNames.length; i++) {
    await prisma.participant.updateMany({
      where: { raffleId: raffle3.id, name: drawnNames[i] },
      data: {
        isDrawn: true,
        drawnAt: new Date(Date.now() - (drawnNames.length - i) * 60000),
        drawOrder: i + 1,
      },
    });
  }

  console.log(
    `Seeded raffle: "${raffle3.name}" with ${raffle3.participants.length} participants (3 drawn)`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
