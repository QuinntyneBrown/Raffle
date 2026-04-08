import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { createSession, SessionData } from '../middleware/auth.js';

const BCRYPT_ROUNDS = 12;

export async function login(
  email: string,
  password: string,
): Promise<{ id: string; email: string } | null> {
  const user = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!user) {
    // Perform a dummy hash comparison to prevent timing attacks
    await bcrypt.compare(password, '$2a$12$invalid.hash.to.prevent.timing');
    return null;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return null;
  }

  return { id: user.id, email: user.email };
}

export function createUserSession(userId: string): SessionData {
  return createSession(userId);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}
