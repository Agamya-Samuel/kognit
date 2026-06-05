import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HowItWorks } from '@/components/HowItWorks';

vi.mock('lucide-react', () => {
  const S = () => null;
  return { UserPlus: S, BookOpen: S, GraduationCap: S, ArrowRight: S, Sparkles: S };
});

describe('HowItWorks', () => {
  it('renders section heading', () => {
    render(<HowItWorks />);
    expect(screen.getByText(/Your path to/i)).toBeInTheDocument();
  });

  it('renders all three steps', () => {
    render(<HowItWorks />);
    expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    expect(screen.getByText('Choose Your Course')).toBeInTheDocument();
    expect(screen.getByText('Start Live Learning')).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    render(<HowItWorks />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });
});
