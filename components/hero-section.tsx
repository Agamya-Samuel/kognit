'use client';

import React from 'react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="min-h-screen relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background to-background/50 flex items-center">
      {/* Decorative gradient orb */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                Welcome to EduTech
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-foreground">Learn, Teach, </span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Grow Together
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
              Connect with students and instructors worldwide. Access thousands of courses, build your skills, and create meaningful learning experiences.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/auth/register"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 text-center"
              >
                Get started for free
              </Link>
              <Link
                href="#features"
                className="border border-primary/30 text-foreground hover:bg-primary/5 px-8 py-4 rounded-lg font-semibold transition-all text-center"
              >
                Explore features
              </Link>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Trusted by learners worldwide</p>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">50K+</p>
                  <p className="text-xs text-muted-foreground">Active Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary">10K+</p>
                  <p className="text-xs text-muted-foreground">Courses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">500+</p>
                  <p className="text-xs text-muted-foreground">Instructors</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-96 lg:h-full hidden lg:flex items-center justify-center">
            <div className="w-full max-w-sm aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/10 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary rounded-xl mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Interactive Learning</h3>
                <p className="text-sm text-muted-foreground">Engage with live classes, quizzes, and hands-on projects</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
