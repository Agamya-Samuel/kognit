import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pricing } from '@/components/Pricing';

vi.mock('lucide-react', () => {
  const S = () => null;
  return { Check: S, Zap: S, Shield: S, Clock: S, Sparkles: S, ArrowRight: S };
});

describe('Pricing', () => {
  it('renders section heading', () => {
    render(<Pricing />);
    expect(screen.getByText(/Learn for/i)).toBeInTheDocument();
  });

  it('renders both plan names', () => {
    render(<Pricing />);
    expect(screen.getByText('Free Explorer')).toBeInTheDocument();
    expect(screen.getByText('Paid Courses')).toBeInTheDocument();
  });

  it('renders plan prices', () => {
    render(<Pricing />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('1,999')).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<Pricing />);
    expect(screen.getByText('Start Free Learning')).toBeInTheDocument();
    expect(screen.getByText('Explore Paid Courses')).toBeInTheDocument();
  });

  it('renders trust badges', () => {
    render(<Pricing />);
    expect(screen.getByText('7-day free trial')).toBeInTheDocument();
    expect(screen.getByText('Cancel anytime')).toBeInTheDocument();
  });
});
