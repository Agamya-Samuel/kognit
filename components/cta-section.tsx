'use client';

import React from 'react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary via-accent to-primary text-white">
      <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-balance">
          Ready to Transform Your English Skills?
        </h2>
        <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto text-balance">
          Join 50,000+ learners who have already achieved fluency. Start your journey with a free trial today.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4">
          <Link
            href="/auth/register"
            className="bg-white text-primary hover:bg-white/90 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold transition-all transform hover:scale-105 text-center text-sm sm:text-base"
          >
            Start Free Trial
          </Link>
          <Link
            href="#features"
            className="border-2 border-white text-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold transition-all text-center text-sm sm:text-base"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-foreground text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold">EduTech</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Empowering learners worldwide with accessible, interactive English education.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-bold text-base sm:text-lg">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Courses</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Live Classes</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-bold text-base sm:text-lg">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-bold text-base sm:text-lg">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 pt-8"></div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/70">
          <p>
            © 2024 EduTech. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-white/70 hover:text-white transition-colors">
              Twitter
            </Link>
            <Link href="#" className="text-white/70 hover:text-white transition-colors">
              LinkedIn
            </Link>
            <Link href="#" className="text-white/70 hover:text-white transition-colors">
              Facebook
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
