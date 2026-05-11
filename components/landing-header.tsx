'use client';

import React from 'react';
import Link from 'next/link';

export function LandingHeader() {
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-border z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-xl sm:text-2xl font-bold text-primary">
            EduTech
          </div>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link href="#features" className="text-foreground/70 hover:text-primary font-medium transition-colors text-sm">
            Features
          </Link>
          <Link href="#teachers" className="text-foreground/70 hover:text-primary font-medium transition-colors text-sm">
            Teachers
          </Link>
          <Link href="#pricing" className="text-foreground/70 hover:text-primary font-medium transition-colors text-sm">
            Pricing
          </Link>
          <Link href="#" className="text-foreground/70 hover:text-primary font-medium transition-colors text-sm">
            Blog
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/auth/login"
            className="text-foreground/70 hover:text-primary font-medium transition-colors text-sm hidden sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 sm:px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105 text-sm whitespace-nowrap"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
