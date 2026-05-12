import { Card, CardContent } from '@edutech/ui';
import { Video, Code2, Users } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'Live Interactive Classes',
    description:
      'Join real-time sessions with expert instructors. Ask questions, participate in discussions, and get instant feedback.',
    gradient: 'from-[hsl(var(--primary))]/10 to-[hsl(var(--primary))]/5',
    iconColor: 'text-[hsl(var(--primary))]',
    iconBg: 'bg-[hsl(var(--primary))]/10',
  },
  {
    icon: Code2,
    title: 'Hands-on Projects',
    description:
      'Build real-world projects with guided assignments. Practice what you learn with practical coding exercises.',
    gradient: 'from-[hsl(var(--secondary))]/10 to-[hsl(var(--secondary))]/5',
    iconColor: 'text-[hsl(var(--secondary))]',
    iconBg: 'bg-[hsl(var(--secondary))]/10',
  },
  {
    icon: Users,
    title: 'Community & Mentors',
    description:
      'Connect with fellow students and industry mentors. Get guidance, collaborate, and grow together.',
    gradient: 'from-[hsl(var(--warning))]/10 to-[hsl(var(--warning))]/5',
    iconColor: 'text-[hsl(var(--warning))]',
    iconBg: 'bg-[hsl(var(--warning))]/10',
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
            Features
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to succeed
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Our platform combines the best of live learning, hands-on practice, and community support.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={`group border-transparent bg-gradient-to-b ${feature.gradient} hover-lift animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg} transition-transform duration-200 group-hover:scale-110`}
                >
                  <feature.icon size={24} className={feature.iconColor} />
                </div>
                <h3 className="font-heading text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
