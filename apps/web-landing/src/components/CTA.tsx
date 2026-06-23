import { Button } from '@edutech/ui';
import { ArrowRight, Sparkles, Users } from 'lucide-react';
import Image from 'next/image';

export function CTA() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-12 sm:py-24">
          {/* Background image */}
          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=600&fit=crop"
            alt="Students celebrating together"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.9)] to-[hsl(var(--primary))] opacity-90" />

          {/* Decorative elements */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute left-[15%] top-[20%] h-3 w-3 rounded-full bg-white/30" />
            <div className="absolute right-[20%] bottom-[30%] h-2 w-2 rounded-full bg-white/20" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <Sparkles size={14} />
              Ready to Launch?
            </div>

            <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Your Future in Tech
              <br className="hidden sm:block" /> Starts Right Now
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Join thousands of ambitious students transforming their careers
              with live, interactive learning. Don&apos;t just learn &mdash;
              build, grow, and thrive.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                className="gap-2 rounded-full border-2 border-white bg-white px-8 font-semibold text-[hsl(var(--primary))] shadow-lg shadow-black/10 transition-all duration-200 hover:bg-white/90 hover:shadow-xl"
              >
                Enroll Today
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-full border-2 border-white/30 bg-transparent px-8 text-white backdrop-blur-sm transition-all duration-200 hover:border-white/60 hover:bg-white/10"
              >
                <Users size={16} />
                Explore All Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
