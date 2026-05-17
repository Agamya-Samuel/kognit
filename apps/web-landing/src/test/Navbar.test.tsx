import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '@/components/Navbar';

vi.mock('lucide-react', () => {
  const S = () => null;
  return { Menu: S, X: S, Sun: S, Moon: S, GraduationCap: S };
});
vi.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));

describe('Navbar', () => {
  it('renders brand name', () => {
    render(<Navbar />);
    expect(screen.getByText('EduTech')).toBeInTheDocument();
  });

  it('renders desktop navigation links', () => {
    render(<Navbar />);
    expect(screen.getAllByText('Features').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pricing').length).toBeGreaterThan(0);
  });

  it('renders Get Started button', () => {
    render(<Navbar />);
    expect(screen.getAllByText('Get Started').length).toBeGreaterThan(0);
  });

  it('toggles mobile menu', () => {
    render(<Navbar />);
    const menuButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuButton);
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument();
  });
});
