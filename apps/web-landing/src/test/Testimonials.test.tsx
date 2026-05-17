import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Testimonials } from '@/components/Testimonials';

vi.mock('lucide-react', () => {
  const S = () => null;
  return { Star: S, Award: S, Users: S, BookOpen: S };
});

describe('Testimonials', () => {
  it('renders section heading', () => {
    render(<Testimonials />);
    expect(screen.getByText(/Hear From Our/i)).toBeInTheDocument();
  });

  it('renders testimonial names', () => {
    render(<Testimonials />);
    expect(screen.getByText('Aisha Khan')).toBeInTheDocument();
    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText('Priya Singh')).toBeInTheDocument();
  });

  it('renders social proof stats', () => {
    render(<Testimonials />);
    expect(screen.getByText('25K+')).toBeInTheDocument();
    expect(screen.getByText('4.9/5')).toBeInTheDocument();
  });
});
