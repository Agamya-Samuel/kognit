import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseCategories } from '@/components/CourseCategories';

vi.mock('lucide-react', () => {
  const S = () => null;
  return { Monitor: S, Briefcase: S, Palette: S, Database: S,
    Smartphone: S, BarChart3: S, ArrowRight: S, TrendingUp: S };
});

describe('CourseCategories', () => {
  it('renders section heading', () => {
    render(<CourseCategories />);
    expect(screen.getByText(/Explore Our/i)).toBeInTheDocument();
  });

  it('renders category names', () => {
    render(<CourseCategories />);
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Data Science')).toBeInTheDocument();
    expect(screen.getByText('Mobile Development')).toBeInTheDocument();
  });

  it('renders View All Courses button', () => {
    render(<CourseCategories />);
    expect(screen.getByText('View All Courses')).toBeInTheDocument();
  });
});
