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
    name: 'Free',
    price: '0',
    period: 'forever',
    popular: false,
    description: 'Perfect for exploring and getting started.',
    features: [
      'Access to free courses',
      'Community forum access',
      'Basic project assignments',
      'Mobile-friendly learning',
    ],
    cta: 'Get Started Free',
    variant: 'outline' as const,
  },
  {
    name: 'Premium',
    price: '499',
    period: '/month',
    popular: true,
    description: 'For serious learners who want the full experience.',
    features: [
      'All free features included',
      'Unlimited live classes',
      'Advanced hands-on projects',
      '1-on-1 mentor sessions',
      'Completion certificates',
      'Priority support',
    ],
    cta: 'Start Premium',
    variant: 'default' as const,
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
          <span className="mb-3 inline-block rounded-full bg-[hsl(var(--primary))]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
            Pricing
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Simple,{' '}
            <span className="text-gradient">transparent pricing</span>
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Start for free. Upgrade when you&apos;re ready to go deeper.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-300 animate-fade-in-up ${
                plan.popular
                  ? 'border-[hsl(var(--primary))] shadow-xl shadow-[hsl(var(--primary))]/10 hover:-translate-y-1'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:shadow-lg hover:-translate-y-1'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Popular gradient background accent */}
              {plan.popular && (
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 gradient-primary" />
              )}

              {plan.popular && (
                <Badge className="absolute -top-0 right-6 translate-y-1/2 gap-1 rounded-full px-3 shadow-md">
                  <Zap size={12} />
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="font-heading text-xl">{plan.name}</CardTitle>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {plan.description}
                </p>
                <div className="mt-5">
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    &#8377;
                  </span>
                  <span className="font-heading text-5xl font-bold">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {plan.period}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
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
                <Button
                  variant={plan.variant}
                  className={`mt-8 w-full rounded-full ${
                    plan.popular
                      ? 'shadow-lg shadow-[hsl(var(--primary))]/25'
                      : ''
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
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
      </div>
    </section>
  );
}
