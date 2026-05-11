'use client';

import React from 'react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-t border-b border-border">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
          Ready to Start Learning?
        </h2>
        <p className="text-xl text-muted-foreground">
          Join thousands of students and instructors building their futures with EduTech today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 text-center"
          >
            Sign up for free
          </Link>
          <Link
            href="/auth/login"
            className="border border-primary/30 text-foreground hover:bg-primary/5 px-8 py-4 rounded-lg font-semibold transition-all text-center"
          >
            Already have an account?
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-background/50 border-t border-border py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">EduTech</h3>
            <p className="text-muted-foreground text-sm">
              Empowering learners and educators worldwide through accessible, quality education.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Courses</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Instructors</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 EduTech. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Twitter
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              LinkedIn
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
