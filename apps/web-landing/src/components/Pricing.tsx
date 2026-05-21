import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from '@edutech/ui';
import { Check, Zap, Shield, Clock } from 'lucide-react';

const plans = [
  {
    name: 'Free Explorer',
    price: '0',
    period: 'forever',
    popular: false,
    description: 'Start learning with our curated selection of free introductory courses.',
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
    description: 'Unlock premium courses with expert mentorship, projects, and certification.',
    features: [
      'All free course benefits',
      'Unlimited Expert-led Live Classes',
      'Dedicated Expert Mentorship access',
      'Hands-on project Feedback',
      'Career support & Certification',
      'Placement Support (Internship & Full Time)'
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
    <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
            Pricing
          </Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Learn for{' '}
            <span className="text-[hsl(var(--success))]">Free</span>{' '}
            or Go{' '}
            <span className="text-[hsl(var(--primary))]">Premium</span>
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Start with free courses, or invest in paid courses starting at{' '}
            <span className="font-semibold text-[hsl(var(--foreground))]">&#8377;1,999</span>{' '}
            — learn at your own pace.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative flex h-full overflow-hidden transition-all duration-300 animate-fade-in-up ${
                plan.popular
                  ? 'border-2 border-[hsl(var(--primary))] shadow-xl shadow-[hsl(var(--primary))]/20 hover:-translate-y-1'
                  : 'card-spotlight border-[hsl(var(--success)/0.4)] bg-[hsl(var(--card))] hover:shadow-lg hover:-translate-y-1'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular ? (
                <Badge className="absolute -top-0 right-6 translate-y-1/2 gap-1 rounded-full px-3 shadow-md">
                  <Zap size={12} />
                  Most Popular
                </Badge>
              ) : (
                <Badge className="absolute -top-0 right-6 translate-y-1/2 gap-1 rounded-full bg-[hsl(var(--success))] px-3 text-[hsl(var(--success-foreground))] shadow-md">
                  {plan.tag}
                </Badge>
              )}

              <CardHeader className="px-8 pt-8 text-center">
                <CardTitle className="font-heading text-xl">{plan.name}</CardTitle>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {plan.description}
                </p>
                <div className="mt-5">
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    &#8377;
                  </span>
                  <span className={`font-heading text-5xl font-bold ${plan.popular ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--success))]'}`}>
                    {plan.price}
                  </span>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {plan.period}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col px-8 pb-8">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
                        <Check
                          size={12}
                          className="text-[hsl(var(--success))]"
                        />
                      </div>
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Button
                    variant={plan.variant}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-[hsl(var(--primary))] border-0 text-white shadow-lg shadow-[hsl(var(--primary))]/25'
                        : 'border-[hsl(var(--success)/0.4)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.08)]'
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
        <div className="mt-8 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.6)] px-6 py-4 text-center backdrop-blur-sm">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            All paid courses include{' '}
            <span className="font-semibold text-[hsl(var(--foreground))]">lifetime access</span>,{' '}
            <span className="font-semibold text-[hsl(var(--foreground))]">expert mentorship</span>, and a{' '}
            <span className="font-semibold text-[hsl(var(--foreground))]">completion certificate</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
