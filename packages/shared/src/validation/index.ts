import { z } from 'zod';
import { THEMES, ANIMATION_STYLES } from '../types/index.js';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createRaffleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  heading: z.string().min(1, 'Heading is required').max(100),
  subheading: z.string().max(250).nullable().optional(),
  theme: z.enum(THEMES),
  animationStyle: z.enum(ANIMATION_STYLES),
  participants: z
    .array(z.string().trim().min(1))
    .min(2, 'At least 2 participants are required')
    .refine(
      (names) => {
        const unique = new Set(names.map((n) => n.toLowerCase().trim()));
        return unique.size === names.length;
      },
      { message: 'Duplicate participant names are not allowed' },
    ),
});

export const selfRegistrationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
});

export type SelfRegistrationInput = z.infer<typeof selfRegistrationSchema>;

export const updateRaffleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  heading: z.string().min(1).max(100).optional(),
  subheading: z.string().max(250).nullable().optional(),
  theme: z.enum(THEMES).optional(),
  animationStyle: z.enum(ANIMATION_STYLES).optional(),
  participants: z
    .array(z.string().trim().min(1))
    .min(2, 'At least 2 participants are required')
    .refine(
      (names) => {
        const unique = new Set(names.map((n) => n.toLowerCase().trim()));
        return unique.size === names.length;
      },
      { message: 'Duplicate participant names are not allowed' },
    )
    .optional(),
});
