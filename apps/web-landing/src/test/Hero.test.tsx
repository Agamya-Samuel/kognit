import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/Hero';

vi.mock('lucide-react', () => {
  const S = () => null;
  return { Sparkles: S, ArrowRight: S, Play: S, Users: S, BookOpen: S,
    Award: S, TrendingUp: S, Star: S, Clock: S, ChevronRight: S,
    Code2: S, BarChart3: S, MonitorSmartphone: S };
});
vi.mock('@/components/TypingEffect', () => ({ TypingEffect: () => null }));

describe('Hero', () => {
  it('renders the headline', () => {
    render(<Hero />);
    expect(screen.getByText(/with Expert Mentors/i)).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<Hero />);
    expect(screen.getByText('Start Your Free Trial')).toBeInTheDocument();
    expect(screen.getByText('Watch Demo')).toBeInTheDocument();
  });

  it('renders stats', () => {
    render(<Hero />);
    expect(screen.getByText('2,500+')).toBeInTheDocument();
    expect(screen.getByText('120+')).toBeInTheDocument();
  });

  it('renders course category pills', () => {
    render(<Hero />);
    expect(screen.getByText('Fullstack')).toBeInTheDocument();
    expect(screen.getByText('Data Science')).toBeInTheDocument();
  });
});
