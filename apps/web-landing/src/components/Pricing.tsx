import { Badge, Button } from '@edutech/ui';
import { Check, Zap, Shield, Clock, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Free Explorer',
    price: '0',
    period: 'forever',
    popular: false,
    description:
      'Start learning with our curated selection of free introductory courses.',
    features: [
      'Access to free introductory courses',
      'Community forum access',
      'Select live session recordings',
      'Basic project exercises',
    ],
    cta: 'Start Free Learning',
    variant: 'outline' as const,
    tag: 'FREE',
  },
  {
    name: 'Paid Courses',
    price: '1,999',
    period: 'onwards per course',
    popular: true,
    description:
      'Unlock premium courses with expert mentorship, projects, and certification.',
    features: [
      'All free course benefits',
      'Unlimited Expert-led Live Classes',
      'Dedicated Expert Mentorship access',
      'Hands-on project Feedback',
      'Career support & Certification',
      'Placement Support (Internship & Full Time)',
    ],
    cta: 'Explore Paid Courses',
    variant: 'default' as const,
    tag: 'PREMIUM',
  },
];

const trustBadges = [
  { icon: Shield, text: '7-day free trial' },
  { icon: Clock, text: 'Cancel anytime' },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative px-4 py-24 sm:px-6 lg:px-8">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[hsl(var(--muted)/0.3)]" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge
            variant="outline"
            className="mb-4 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--primary))]"
          >
            Pricing
          </Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Learn for{' '}
            <span className="text-[hsl(var(--success))]">free</span> or go{' '}
            <span className="gradient-text">premium</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[hsl(var(--muted-foreground))]">
            Start with free courses, or invest in premium courses starting at{' '}
            <span className="font-semibold text-[hsl(var(--foreground))]">
              &#8377;1,999
            </span>{' '}
            &mdash; learn at your own pace.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative flex h-full flex-col overflow-hidden rounded-3xl border transition-all duration-300 animate-fade-in-up ${
                plan.popular
                  ? 'border-2 border-[hsl(var(--primary))] bg-[hsl(var(--card))] shadow-2xl shadow-[hsl(var(--primary)/0.15)] hover:-translate-y-1'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:-translate-y-1 hover:shadow-xl'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Badge */}
              {plan.popular ? (
                <div className="absolute -top-px right-6">
                  <div className="flex items-center gap-1.5 rounded-b-lg bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-4 py-1.5 text-xs font-bold text-white shadow-md">
                    <Zap size={12} />
                    Most Popular
                  </div>
                </div>
              ) : (
                <div className="absolute -top-px right-6">
                  <div className="rounded-b-lg bg-[hsl(var(--success))] px-4 py-1.5 text-xs font-bold text-white shadow-md">
                    {plan.tag}
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="px-8 pt-10 pb-6 text-center">
                <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                  {plan.description}
                </p>
                <div className="mt-6">
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    &#8377;
                  </span>
                  <span
                    className={`font-heading text-5xl font-bold ${
                      plan.popular
                        ? 'gradient-text'
                        : 'text-[hsl(var(--success))]'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-1 flex-col px-8 pb-8">
                <ul className="flex-1 space-y-3.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--success)/0.1)]">
                        <Check size={12} className="text-[hsl(var(--success))]" />
                      </div>
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button
                    variant={plan.variant}
                    className={`w-full rounded-full ${
                      plan.popular
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.25)] hover:shadow-xl'
                        : 'border-[hsl(var(--success)/0.4)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.08)]'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {trustBadges.map((badge) => (
            <div
              key={badge.text}
              className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"
            >
              <badge.icon size={16} className="text-[hsl(var(--success))]" />
              {badge.text}
            </div>
          ))}
        </div>

        {/* Value proposition strip */}
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.6)] px-6 py-4 text-center backdrop-blur-sm">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            All paid courses include{' '}
            <span className="font-semibold text-[hsl(var(--foreground))]">
              lifetime access
            </span>
            ,{' '}
            <span className="font-semibold text-[hsl(var(--foreground))]">
              expert mentorship
            </span>
            , and a{' '}
            <span className="font-semibold text-[hsl(var(--foreground))]">
              completion certificate
            </span>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
