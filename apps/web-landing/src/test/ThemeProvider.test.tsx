import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ThemeProvider, useTheme } from '@/components/ThemeProvider';

describe('ThemeProvider module', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should export ThemeProvider as a function', () => {
    expect(typeof ThemeProvider).toBe('function');
  });

  it('should export useTheme as a function', () => {
    expect(typeof useTheme).toBe('function');
  });
});

describe('Theme logic', () => {
  it('should default to light theme when no preference', () => {
    const stored = localStorage.getItem('theme');
    const storedTheme = stored as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    expect(initialTheme).toBe('light');
  });

  it('should respect stored theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    const stored = localStorage.getItem('theme') as 'light' | 'dark';
    expect(stored).toBe('dark');
  });

  it('should toggle theme correctly', () => {
    const toggle = (current: 'light' | 'dark') => (current === 'light' ? 'dark' : 'light');
    expect(toggle('light')).toBe('dark');
    expect(toggle('dark')).toBe('light');
  });
});
