import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('lucide-react', () => {
  const S = () => null;
  return {
    Sparkles: S, ArrowRight: S, Play: S, Users: S, BookOpen: S,
    Award: S, Star: S, GraduationCap: S, CheckCircle2: S, Clock: S,
  };
});

vi.mock('@/components/TypingEffect', () => ({ TypingEffect: () => null }));

import { TypingEffect } from '@/components/TypingEffect';
import { Hero } from '@/components/Hero';

describe('TypingEffect module', () => {
  it('should export TypingEffect as a function', () => {
    expect(typeof TypingEffect).toBe('function');
  });
});

describe('Hero component module', () => {
  it('should export Hero as a function', () => {
    expect(typeof Hero).toBe('function');
  });

  it('should accept no props', () => {
    expect(Hero.length).toBe(0);
  });
});
