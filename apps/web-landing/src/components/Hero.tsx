import { Badge } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Sparkles, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-28 lg:px-8 lg:pt-36">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Primary gradient orb - top right */}
        <div className="animate-pulse-glow absolute -right-20 -top-20 h-[600px] w-[600px] rounded-full bg-[hsl(var(--primary))]/8 blur-3xl" />
        {/* Secondary gradient orb - bottom left */}
        <div className="animate-pulse-glow absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-[hsl(var(--secondary))]/6 blur-3xl delay-500" />
        {/* Accent dot - top left */}
        <div className="animate-float absolute left-1/4 top-20 h-2 w-2 rounded-full bg-[hsl(var(--warning))] opacity-60" />
        {/* Accent dot - bottom right */}
        <div className="animate-float absolute bottom-40 right-1/4 h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] opacity-40 delay-300" />
      </div>

      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="animate-fade-in-up mb-8 inline-flex">
          <Badge
            variant="warning"
            className="gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium"
          >
            <Sparkles size={14} />
            Live classes now available
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Learn from the best{' '}
          <span className="text-gradient">instructors</span>{' '}
          in India
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-xl">
          Interactive courses, live classes, and hands-on assignments designed for
          college students. Master the skills that actually matter.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2 rounded-full px-8">
            Start Learning Free
            <ArrowRight size={16} />
          </Button>
          <Button variant="outline" size="lg" className="rounded-full px-8">
            Browse Courses
          </Button>
        </div>

        {/* Social proof */}
        <div className="animate-fade-in delay-500 mt-14 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
          <div className="flex -space-x-2">
            {['PS', 'AP', 'SR', 'VK'].map((initials, i) => (
              <div
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[hsl(var(--background))] bg-[hsl(var(--primary))] text-[10px] font-semibold text-[hsl(var(--primary-foreground))]"
                style={{ zIndex: 4 - i }}
              >
                {initials}
              </div>
            ))}
          </div>
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            <span className="font-semibold text-[hsl(var(--foreground))]">2,500+</span>{' '}
            students already learning
          </div>
        </div>
      </div>
    </section>
  );
}
