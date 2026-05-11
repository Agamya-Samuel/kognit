'use client';

import React from 'react';
import Link from 'next/link';

export function LandingHeader() {
  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            EduTech
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-foreground hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-foreground hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="#" className="text-foreground hover:text-primary transition-colors">
            About
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-foreground hover:text-primary transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}
