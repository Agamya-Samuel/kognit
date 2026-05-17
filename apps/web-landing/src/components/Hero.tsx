'use client';

import { Badge } from '@edutech/ui';
import { Button } from '@edutech/ui';
import {
  Sparkles,
  ArrowRight,
  Play,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Star,
  Clock,
  ChevronRight,
  Code2,
  BarChart3,
  MonitorSmartphone,
} from 'lucide-react';
import { TypingEffect } from './TypingEffect';

const stats = [
  { icon: Users, value: '2,500+', label: 'Active Students' },
  { icon: BookOpen, value: '120+', label: 'Live Courses' },
  { icon: Award, value: '95%', label: 'Completion Rate' },
  { icon: Star, value: '4.9', label: 'Avg Rating' },
];

const courseCards = [
  {
    icon: Code2,
    label: 'Fullstack',
    color: 'primary',
    students: '1.2k enrolled',
  },
  {
    icon: BarChart3,
    label: 'Data Science',
    color: 'secondary',
    students: '890 enrolled',
  },
  {
    icon: MonitorSmartphone,
    label: 'Android',
    color: 'warning',
    students: '670 enrolled',
  },
];

const floatingCards = [
  {
    title: 'Next Live Class',
    subtitle: 'React Masterclass',
    detail: 'Today, 6:00 PM',
    icon: Clock,
    position: 'top-8 -right-2 xl:-right-6',
    delay: '0.3s',
  },
  {
    title: 'New Enrollment',
    subtitle: 'Students this week',
    detail: '+247',
    icon: TrendingUp,
    position: 'bottom-20 -left-4 xl:-left-8',
    delay: '0.8s',
  },
  {
    title: 'Top Rated',
    subtitle: 'Course rating',
    detail: '4.9 / 5.0',
    icon: Star,
    position: 'top-1/2 -translate-y-1/2 -right-8 xl:-right-12',
    delay: '1.3s',
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8 lg:pt-36 xl:pt-40">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Primary gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.04)] via-transparent to-[hsl(var(--secondary)/0.03)]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Glowing orbs */}
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[hsl(var(--primary))] opacity-[0.08] blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-32 right-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-[hsl(var(--secondary))] opacity-[0.07] blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-0 h-[300px] w-[300px] rounded-full bg-purple-500 opacity-[0.04] blur-[80px] animate-pulse-glow" style={{ animationDelay: '4s' }} />

        {/* Geometric accent lines */}
        <div className="absolute top-20 left-12 h-24 w-px bg-gradient-to-b from-transparent via-[hsl(var(--primary)/0.15)] to-transparent" />
        <div className="absolute top-40 right-20 h-32 w-px bg-gradient-to-b from-transparent via-[hsl(var(--secondary)/0.12)] to-transparent" />
        <div className="absolute bottom-32 left-1/3 h-px w-40 bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.1)] to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Content column */}
          <div className="text-center lg:text-left">
            {/* Trust badge */}
            <div className="animate-fade-in-up mb-6 inline-flex">
              <Badge
                variant="warning"
                className="gap-1.5 rounded-full border border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.08)] px-4 py-1.5 text-sm font-semibold shadow-lg shadow-[hsl(var(--warning)/0.08)]"
              >
                <Sparkles size={14} />
                Live Learning, Real Skills
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up delay-100 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl xl:text-7xl">
              Master
              <br />
              <TypingEffect words={['Fullstack', 'Android', 'Data Science']} />
              <br />
              <span className="text-gradient-bold">with Expert Mentors</span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-lg text-lg leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-xl lg:mx-0">
              Transform your career with live, interactive courses. Gain practical
              skills in Software, Data, and more — guided by industry professionals.
            </p>

            {/* CTA group */}
            <div className="animate-fade-in-up delay-300 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Button size="lg" className="h-12 gap-2 px-8 text-base shadow-xl shadow-[hsl(var(--primary)/0.25)]" aria-label="Start your free trial">
                Start Your Free Trial
                <ArrowRight size={16} />
              </Button>
              <Button variant="outline" size="lg" className="h-12 gap-2 px-8 text-base" aria-label="Watch demo video">
                <Play size={16} />
                Watch Demo
              </Button>
            </div>

            {/* Stats row */}
            <div className="animate-fade-in delay-500 mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-8 lg:justify-start">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.08)]">
                    <stat.icon size={16} className="text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[hsl(var(--foreground))]">{stat.value}</div>
                    <div className="text-[11px] text-[hsl(var(--muted-foreground))]">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual panel */}
          <div className="relative hidden lg:flex lg:min-h-[520px] items-center justify-center">
            {/* Ambient glow behind cards */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-72 w-72 rounded-full bg-gradient-to-br from-[hsl(var(--primary)/0.08)] to-[hsl(var(--secondary)/0.06)] blur-3xl" />
            </div>

            {/* Main dashboard card */}
            <div className="relative z-10 w-80 animate-fade-in-up">
              <div className="rounded-2xl border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card)/0.85)] p-5 shadow-2xl shadow-[hsl(var(--primary)/0.08)] backdrop-blur-md">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-xl">
                      <BookOpen size={18} className="text-[hsl(var(--primary-foreground))]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[hsl(var(--foreground))]">Live Class</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">Advanced React Patterns</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-[hsl(var(--success)/0.1)] px-2 py-0.5">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--success))]" />
                    <span className="text-[10px] font-medium text-[hsl(var(--success))]">LIVE</span>
                  </div>
                </div>

                {/* Video placeholder */}
                <div className="gradient-primary mb-4 flex aspect-video items-center justify-center rounded-xl opacity-90">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <Play size={20} className="text-white" />
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-[hsl(var(--muted-foreground))]">Course Progress</span>
                    <span className="font-semibold text-[hsl(var(--primary))]">72%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]" />
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {['A', 'B', 'C', 'D'].map((letter) => (
                        <div
                          key={letter}
                          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[hsl(var(--card))] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-[8px] font-bold text-white"
                        >
                          {letter}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-[hsl(var(--muted-foreground))]">+142 learning</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={10} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification cards */}
            {floatingCards.map((card) => (
              <div
                key={card.title}
                className={`absolute ${card.position} z-20 animate-fade-in-up`}
                style={{ animationDelay: card.delay }}
              >
                <div className="flex items-center gap-2.5 rounded-xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.8)] px-3.5 py-2.5 shadow-lg backdrop-blur-md">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)]">
                    <card.icon size={13} className="text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-[hsl(var(--foreground))]">{card.title}</div>
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{card.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Course category pills */}
        <div className="animate-fade-in delay-500 mt-16 hidden lg:block">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Popular tracks:</span>
            {courseCards.map((course) => (
              <div
                key={course.label}
                className="group flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.5)] px-4 py-2 backdrop-blur-sm transition-colors hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary)/0.04)]"
              >
                <course.icon size={14} className="text-[hsl(var(--primary))]" />
                <span className="text-xs font-medium text-[hsl(var(--foreground))]">{course.label}</span>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{course.students}</span>
                <ChevronRight size={12} className="text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-0.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
