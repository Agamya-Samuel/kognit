'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@edutech/ui';
import { useTheme } from './ThemeProvider';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Courses', href: '#courses' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-[hsl(var(--border)/0.5)] bg-[hsl(var(--background)/0.9)] shadow-sm backdrop-blur-lg'
          : 'bg-transparent'
      }`}
    >
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a
          href="#"
          className="group flex items-center gap-2.5 font-heading text-xl font-bold"
          aria-label="EduTech home"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-[hsl(var(--primary-foreground))] shadow-md shadow-[hsl(var(--primary)/0.25)] transition-transform duration-200 group-hover:scale-105">
            <GraduationCap size={18} />
          </div>
          <span className="text-[hsl(var(--foreground))]">
            Edu<span className="text-[hsl(var(--primary))]">Tech</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative rounded-lg px-3.5 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-all duration-200 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-9 w-9 rounded-lg"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <Button
            variant="outline"
            className="gap-1.5 rounded-full px-5 text-sm font-semibold"
          >
            Get Started
            <ArrowRight size={14} />
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-9 w-9"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="h-9 w-9"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        role="navigation"
        aria-label="Mobile navigation"
        className={`overflow-hidden border-t border-[hsl(var(--border)/0.5)] bg-[hsl(var(--background))] transition-all duration-300 ease-out md:hidden ${
          mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-1 px-4 pb-5 pt-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3">
            <Button
              variant="outline"
              className="w-full gap-1.5 rounded-full font-semibold"
            >
              Get Started
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
