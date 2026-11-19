import { describe, expect, it } from 'vitest';
import { normalizeApiKey } from '@/services/ai/openrouter';

describe('normalizeApiKey', () => {
  it('trims whitespace and quotes', () => {
    expect(normalizeApiKey('  "sk-or-v1-abc"  ')).toBe('sk-or-v1-abc');
  });

  it('removes internal whitespace from paste glitches', () => {
    expect(normalizeApiKey('sk-or-v1- ab cd')).toBe('sk-or-v1-abcd');
  });

  it('strips zero-width characters', () => {
    expect(normalizeApiKey('\u200Bsk-or-v1-xyz\uFEFF')).toBe('sk-or-v1-xyz');
  });
});
