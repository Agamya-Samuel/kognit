'use client';

import { LandingHeader } from '@/components/landing-header';
import { HeroSection } from '@/components/hero-section';
import { FeaturesSection } from '@/components/features-section';
import { CTASection, Footer } from '@/components/cta-section';

export default function Home() {
  return (
    <main className="bg-background">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
