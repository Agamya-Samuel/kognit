import { describe, it, expect, vi } from 'vitest';

vi.mock('lucide-react', () => {
  const S = () => null;
  return {
    Sparkles: S, ArrowRight: S, Play: S, Users: S, BookOpen: S,
    Award: S, Star: S, GraduationCap: S, CheckCircle2: S, Clock: S,
    Menu: S, X: S, Sun: S, Moon: S,
    Check: S, Zap: S, Shield: S,
    Video: S, Code2: S, ArrowUpRight: S,
    UserPlus: S, ArrowRight: S,
    Monitor: S, Briefcase: S, Palette: S, Database: S,
    Smartphone: S, BarChart3: S, TrendingUp: S,
    Quote: S, Github: S, Twitter: S, Linkedin: S,
    Mail: S, MapPin: S, Phone: S, Heart: S,
  };
});

vi.mock('@/components/TypingEffect', () => ({ TypingEffect: () => null }));
vi.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
  ThemeProvider: ({ children }: any) => children,
}));

import Home from '@/app/page';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { CourseCategories } from '@/components/CourseCategories';
import { Testimonials } from '@/components/Testimonials';
import { Pricing } from '@/components/Pricing';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/Footer';

describe('Home page module', () => {
  it('should export Home as a function', () => {
    expect(typeof Home).toBe('function');
  });

  it('should export all section components as functions', () => {
    expect(typeof Navbar).toBe('function');
    expect(typeof Hero).toBe('function');
    expect(typeof Features).toBe('function');
    expect(typeof HowItWorks).toBe('function');
    expect(typeof CourseCategories).toBe('function');
    expect(typeof Testimonials).toBe('function');
    expect(typeof Pricing).toBe('function');
    expect(typeof CTA).toBe('function');
    expect(typeof Footer).toBe('function');
  });
});
