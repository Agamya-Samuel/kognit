import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Features } from '@/components/Features';

vi.mock('lucide-react', () => {
  const S = () => null;
  return { Video: S, Code2: S, Users: S };
});

describe('Features', () => {
  it('renders section heading', () => {
    render(<Features />);
    expect(screen.getByText('Everything you need to succeed')).toBeInTheDocument();
  });

  it('renders all three feature cards', () => {
    render(<Features />);
    expect(screen.getByText('Live Interactive Classes')).toBeInTheDocument();
    expect(screen.getByText('Build Real-World Projects')).toBeInTheDocument();
    expect(screen.getByText('Expert Mentorship & Community')).toBeInTheDocument();
  });

  it('renders the Features badge', () => {
    render(<Features />);
    expect(screen.getByText('Features')).toBeInTheDocument();
  });
});
