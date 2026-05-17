import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';

vi.mock('lucide-react', () => {
  const S = () => null;
  return {
    Github: S, Twitter: S, Linkedin: S, GraduationCap: S,
    Mail: S, MapPin: S, Phone: S, Heart: S,
  };
});

describe('Footer', () => {
  it('renders brand name', () => {
    render(React.createElement(Footer));
    expect(screen.getByText('EduTech')).toBeInTheDocument();
  });

  it('renders contact email', () => {
    render(React.createElement(Footer));
    expect(screen.getByText('hello@edutech.in')).toBeInTheDocument();
  });

  it('renders quick links', () => {
    render(React.createElement(Footer));
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('renders legal links', () => {
    render(React.createElement(Footer));
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('renders copyright', () => {
    render(React.createElement(Footer));
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });
});
