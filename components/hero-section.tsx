'use client';

import React from 'react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32 lg:py-40 mt-16">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
              Transform Your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Learning Journey</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              EduTech combines AI-powered personalization with interactive learning to help you master any skill, faster and more effectively.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 text-center w-full sm:w-auto"
            >
              Start Learning Free
            </Link>
            <Link href="#features"
              className="border border-primary/30 text-foreground hover:bg-primary/5 px-8 py-4 rounded-lg font-semibold transition-all text-center w-full sm:w-auto"
            >
              Explore Features
            </Link>
          </div>

          {/* Social proof */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Trusted by learners worldwide</p>
            <div className="flex items-center justify-center gap-8 text-center flex-wrap">
              <div>
                <p className="text-2xl font-bold">50K+</p>
                <p className="text-xs text-muted-foreground">Active Learners</p>
              </div>
              <div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-xs text-muted-foreground">Courses</p>
              </div>
              <div>
                <p className="text-2xl font-bold">4.9★</p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
