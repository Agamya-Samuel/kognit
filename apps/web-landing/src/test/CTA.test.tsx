import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CTA } from '@/components/CTA';

vi.mock('lucide-react', () => {
  const S = () => null;
  return { ArrowRight: S, Sparkles: S, Users: S };
});

describe('CTA', () => {
  it('renders headline', () => {
    render(<CTA />);
    expect(screen.getByText(/Your Future in Tech/i)).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<CTA />);
    expect(screen.getByText('Enroll Today')).toBeInTheDocument();
    expect(screen.getByText('Explore All Courses')).toBeInTheDocument();
  });

  it('renders subtitle text', () => {
    render(<CTA />);
    expect(screen.getByText(/Join thousands of ambitious students/i)).toBeInTheDocument();
  });
});
