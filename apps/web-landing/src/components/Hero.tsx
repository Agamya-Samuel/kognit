'use client';

import { Badge } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Sparkles, ArrowRight, Play, Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import { TypingEffect } from './TypingEffect';

const stats = [
  { icon: Users, value: '2,500+', label: 'Active Students' },
  { icon: BookOpen, value: '120+', label: 'Live Courses' },
  { icon: Award, value: '95%', label: 'Completion Rate' },
];

const floatingCards = [
  {
    title: 'Next Live Class',
    subtitle: 'React Masterclass',
    time: 'Today, 6:00 PM',
    icon: TrendingUp,
    position: 'top-12 -right-4',
    delay: '0s',
  },
  {
    title: 'Enrollment',
    subtitle: 'Students this week',
    value: '+247',
    icon: Users,
    position: 'bottom-16 -left-6',
    delay: '1.5s',
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8 lg:pt-40">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--primary))] via-[hsl(var(--background))] to-[hsl(var(--background))] opacity-[0.03]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Glowing orbs */}
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[hsl(var(--primary))] opacity-10 blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-40 right-0 h-[400px] w-[400px] rounded-full bg-[hsl(var(--secondary))] opacity-10 blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-purple-500 opacity-5 blur-[80px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="animate-fade-in-up mb-6 inline-flex">
              <Badge
                variant="warning"
                className="gap-1.5 rounded-full border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/10 px-4 py-1.5 text-sm font-semibold shadow-lg shadow-[hsl(var(--warning))]/10"
              >
                <Sparkles size={14} />
                Live Learning, Real Skills
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up delay-100 font-heading text-4xl font-extrabold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl xl:text-7xl">
              Master{' '}
              <br />
              <TypingEffect words={['Fullstack', 'Android', 'Data Science']} />
              <br />
              <span className="text-gradient-bold">with Expert Mentors</span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-xl lg:mx-0">
              Transform your career with live, interactive courses. Gain practical
              skills in Software, Data, and more.
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up delay-300 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Button size="lg" className="h-12 text-base gap-2 px-8 shadow-xl shadow-[hsl(var(--primary))]/30">
                Start Your Free Trial
                <ArrowRight size={16} />
              </Button>
              <Button variant="outline" size="lg" className="h-12 text-base gap-2 px-8">
                <Play size={16} />
                Watch Demo
              </Button>
            </div>

            {/* Stats row */}
            <div className="animate-fade-in delay-500 mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:justify-start">
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <stat.icon size={18} className="text-[hsl(var(--primary))]" />
                  <div>
                    <div className="text-lg font-bold text-[hsl(var(--foreground))]">{stat.value}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual area with floating cards */}
          <div className="relative hidden lg:flex lg:h-[480px] items-center justify-center">
            {/* Central hero image/illustration placeholder */}
            <div className="relative h-80 w-80 rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-10 blur-3xl animate-pulse-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Main visual card */}
              <div className="relative z-10 w-72 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl shadow-[hsl(var(--primary))]/10 animate-fade-in-up">
                {/* Mock course interface */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]" />
                  <div>
                    <div className="text-sm font-semibold text-[hsl(var(--foreground))]">Live Class</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">Advanced React Patterns</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-[hsl(var(--muted-foreground))]">Progress</span>
                    <span className="font-medium text-[hsl(var(--primary))]">72%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]" />
                  </div>
                </div>
                {/* Participants */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['A', 'B', 'C', 'D'].map((letter, i) => (
                      <div
                        key={i}
                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[hsl(var(--card))] bg-[hsl(var(--primary))] text-[8px] font-medium text-[hsl(var(--primary-foreground))]"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">+142 learning now</span>
                </div>
              </div>
            </div>

            {/* Floating notification cards */}
            {floatingCards.map((card, i) => (
              <div
                key={card.title}
                className={`absolute ${card.position} z-20 animate-fade-in-up rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 px-4 py-3 shadow-lg backdrop-blur-sm`}
                style={{ animationDelay: card.delay }}
              >
                <div className="flex items-center gap-2">
                  <card.icon size={14} className="text-[hsl(var(--primary))]" />
                  <div>
                    <div className="text-xs font-medium text-[hsl(var(--foreground))]">{card.title}</div>
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      {'value' in card ? card.value : card.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
