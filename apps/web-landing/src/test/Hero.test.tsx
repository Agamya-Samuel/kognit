import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/Hero';

vi.mock('lucide-react', () => {
  const S = () => null;
  return {
    Sparkles: S, ArrowRight: S, Play: S, Users: S, BookOpen: S,
    Award: S, Star: S, GraduationCap: S, CheckCircle2: S, Clock: S,
  };
});
vi.mock('@/components/TypingEffect', () => ({ TypingEffect: () => null }));

describe('Hero', () => {
  it('renders the headline', () => {
    render(<Hero />);
    expect(screen.getByText(/Launch Your Tech Career/i)).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<Hero />);
    expect(screen.getByText('Start Learning Free')).toBeInTheDocument();
    expect(screen.getByText('Watch Demo')).toBeInTheDocument();
  });

  it('renders stats', () => {
    render(<Hero />);
    expect(screen.getByText('25,000+')).toBeInTheDocument();
    expect(screen.getByText('120+')).toBeInTheDocument();
  });

  it('renders trust points', () => {
    render(<Hero />);
    expect(screen.getByText('Live expert mentorship')).toBeInTheDocument();
    expect(screen.getByText('Real-world projects')).toBeInTheDocument();
  });
});
