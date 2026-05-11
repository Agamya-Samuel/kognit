'use client';

import React from 'react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8 flex flex-col justify-center">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Master English in <span className="text-primary">30 Days</span>
              </h1>
              <p className="text-base sm:text-lg text-foreground/70 leading-relaxed max-w-lg text-balance">
                Learn from world-class instructors with our interactive live classes, personalized feedback, and proven methodology trusted by 50,000+ learners worldwide.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Link
                href="/auth/register"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transition-all transform hover:scale-105 text-center text-sm sm:text-base"
              >
                Start Free Trial
              </Link>
              <Link
                href="#features"
                className="border-2 border-primary text-primary hover:bg-primary/5 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transition-all text-center text-sm sm:text-base"
              >
                Explore Features
              </Link>
            </div>

            {/* Social Proof */}
            <div className="pt-4 sm:pt-6 border-t border-border">
              <p className="text-xs sm:text-sm text-foreground/60 font-medium mb-3">Trusted by learners worldwide</p>
              <div className="flex flex-wrap gap-6 sm:gap-8">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">50K+</p>
                  <p className="text-xs sm:text-sm text-foreground/60">Active Learners</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">500+</p>
                  <p className="text-xs sm:text-sm text-foreground/60">Courses</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">4.9★</p>
                  <p className="text-xs sm:text-sm text-foreground/60">Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual - Instructor Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-2xl"></div>
              
              {/* Card */}
              <div className="relative bg-gradient-to-br from-primary to-accent rounded-3xl p-6 sm:p-8 text-white shadow-xl">
                <div className="space-y-6">
                  {/* Instructor Avatar Circle */}
                  <div className="flex justify-center">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center">
                        <span className="text-4xl sm:text-6xl">👨‍🏫</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center space-y-3">
                    <h3 className="text-xl sm:text-2xl font-bold">Expert Instructors</h3>
                    <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                      Learn directly from certified English teachers with 10+ years of experience in helping students achieve fluency.
                    </p>
                    <div className="flex justify-center gap-1">
                      <span>⭐</span>
                      <span>⭐</span>
                      <span>⭐</span>
                      <span>⭐</span>
                      <span>⭐</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
