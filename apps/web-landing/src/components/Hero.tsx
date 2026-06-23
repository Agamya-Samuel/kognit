'use client';

import { Badge } from '@edutech/ui';
import { Button } from '@edutech/ui';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  Play,
  Users,
  BookOpen,
  Award,
  Star,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';
import { TypingEffect } from './TypingEffect';

const stats = [
  { icon: Users, value: '25,000+', label: 'Active Students' },
  { icon: BookOpen, value: '120+', label: 'Live Courses' },
  { icon: Award, value: '95%', label: 'Completion Rate' },
  { icon: Star, value: '4.9', label: 'Avg Rating' },
];

const trustPoints = [
  'Live expert mentorship',
  'Real-world projects',
  'Career support',
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-6 sm:pb-28 lg:px-8">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Warm gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.05)] via-[hsl(var(--background))] to-[hsl(var(--accent)/0.04)]" />

        {/* Radial glow top-right */}
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[hsl(var(--primary))] opacity-[0.06] blur-[150px]" />
        {/* Radial glow bottom-left */}
        <div className="absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-[hsl(var(--accent))] opacity-[0.05] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Content column */}
          <div className="order-2 text-center lg:order-1 lg:text-left">
            {/* Trust badge */}
            <div className="animate-fade-in-up mb-6 inline-flex">
              <Badge
                variant="outline"
                className="gap-2 rounded-full border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.06)] px-4 py-1.5 text-sm font-semibold text-[hsl(var(--primary))]"
              >
                <Sparkles size={14} />
                Live Learning, Real Results
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up delay-100 font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[3.5rem] xl:text-6xl">
              Launch Your
              <br />
              Career with
              <br />
              <TypingEffect words={['Fullstack', 'Data Science', 'Android', 'AI & ML']} />
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-lg text-lg leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-xl lg:mx-0">
              Join live, interactive classes led by industry experts. Build
              real projects, get mentored, and land your dream job.
            </p>

            {/* Trust points */}
            <div className="animate-fade-in-up delay-300 mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:mx-0 lg:justify-start">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]"
                >
                  <CheckCircle2
                    size={14}
                    className="text-[hsl(var(--success))]"
                  />
                  {point}
                </div>
              ))}
            </div>

            {/* CTA group */}
            <div className="animate-fade-in-up delay-400 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Button
                className="gap-2 rounded-full bg-[hsl(var(--primary))] px-7 text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.25)] transition-all hover:shadow-xl"
              >
                Start Learning Free
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-full px-7"
              >
                <Play size={16} />
                Watch Demo
              </Button>
            </div>

            {/* Stats row */}
            <div className="animate-fade-in delay-500 mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.5)] p-3 text-center backdrop-blur-sm"
                >
                  <stat.icon
                    size={18}
                    className="mx-auto mb-1 text-[hsl(var(--primary))]"
                  />
                  <div className="font-heading text-lg font-bold">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image panel */}
          <div className="relative order-1 lg:order-2 lg:min-h-[540px]">
            {/* Main hero image */}
            <div className="animate-scale-in relative mx-auto max-w-md lg:mx-0 lg:max-w-none">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-[hsl(var(--primary)/0.12)]">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=faces"
                  alt="Students collaborating on a tech project in a modern learning space"
                  fill
                  className="aspect-[4/3] w-full object-cover"
                  priority
                />
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background)/0.4)] to-transparent" />
              </div>

              {/* Floating card: Live Class */}
              <div className="absolute -bottom-4 -left-4 z-20 animate-fade-in-up delay-300 sm:-left-8">
                <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.9)] px-4 py-3 shadow-xl backdrop-blur-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]">
                    <GraduationCap
                      size={18}
                      className="text-[hsl(var(--primary-foreground))]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-[hsl(var(--success))]" />
                      <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
                        Live Now
                      </span>
                    </div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">
                      React Masterclass
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card: Students enrolled */}
              <div className="absolute -right-2 top-6 z-20 animate-fade-in-up delay-500 sm:-right-6">
                <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.9)] px-4 py-3 shadow-xl backdrop-blur-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)]">
                    <Users
                      size={18}
                      className="text-[hsl(var(--accent))]"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[hsl(var(--foreground))]">
                      +247
                    </div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">
                      enrolled this week
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card: Rating */}
              <div className="absolute -bottom-2 right-8 z-20 animate-fade-in-up delay-400 sm:-bottom-4 sm:right-4">
                <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.9)] px-3 py-2 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-0.5" role="img" aria-label="Rated 4.9 out of 5 stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className="fill-[hsl(var(--warning))] text-[hsl(var(--warning))]"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold">4.9/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
