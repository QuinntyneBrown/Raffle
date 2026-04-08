import { describe, it, expect } from 'vitest';
import { createRaffleSchema, updateRaffleSchema } from './index.js';

describe('createRaffleSchema', () => {
  const validBase = {
    name: 'Test Raffle',
    heading: 'Test Heading',
    theme: 'cosmic' as const,
    animationStyle: 'slot_machine' as const,
    participants: ['Alice', 'Bob'],
  };

  it('defaults presentationMode to false when not provided', () => {
    const result = createRaffleSchema.parse(validBase);
    expect(result.presentationMode).toBe(false);
  });

  it('accepts presentationMode true', () => {
    const result = createRaffleSchema.parse({ ...validBase, presentationMode: true });
    expect(result.presentationMode).toBe(true);
  });

  it('accepts presentationMode false', () => {
    const result = createRaffleSchema.parse({ ...validBase, presentationMode: false });
    expect(result.presentationMode).toBe(false);
  });

  it('rejects non-boolean presentationMode', () => {
    const result = createRaffleSchema.safeParse({ ...validBase, presentationMode: 'yes' });
    expect(result.success).toBe(false);
  });
});

describe('updateRaffleSchema', () => {
  it('accepts presentationMode as optional boolean', () => {
    const result = updateRaffleSchema.parse({ presentationMode: true });
    expect(result.presentationMode).toBe(true);
  });

  it('allows omitting presentationMode', () => {
    const result = updateRaffleSchema.parse({ name: 'Updated' });
    expect(result.presentationMode).toBeUndefined();
  });

  it('rejects non-boolean presentationMode', () => {
    const result = updateRaffleSchema.safeParse({ presentationMode: 'yes' });
    expect(result.success).toBe(false);
  });
});
