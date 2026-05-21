import { Card, CardContent, Badge } from '@edutech/ui';
import { Video, Code2, Users } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'Live Interactive Classes',
    description:
      'Engage directly with expert instructors. Ask questions, get instant feedback, and stay motivated.',
    detail: 'Real-time learning, direct instructor interaction.',
    gradient: 'from-[hsl(var(--primary))]/15 to-[hsl(var(--primary))]/5',
    iconColor: 'text-[hsl(var(--primary))]',
    iconBg: 'bg-[hsl(var(--primary))]/10',
  },
  {
    icon: Code2,
    title: 'Build Real-World Projects',
    description:
      'Apply your knowledge with practical, hands-on assignments. Develop a portfolio that will stand out.',
    detail: 'Practical assignments, portfolio-ready outcomes.',
    gradient: 'from-[hsl(var(--accent))]/15 to-[hsl(var(--accent))]/5',
    iconColor: 'text-[hsl(var(--accent))]',
    iconBg: 'bg-[hsl(var(--accent))]/10',
  },
  {
    icon: Users,
    title: 'Expert Mentorship & Community',
    description:
      'Get personalized guidance from industry pros. Connect with peers, share insights, and grow your network.',
    detail: 'Personalized guidance, collaborative peer network.',
    gradient: 'from-[hsl(var(--warning))]/15 to-[hsl(var(--warning))]/5',
    iconColor: 'text-[hsl(var(--warning))]',
    iconBg: 'bg-[hsl(var(--warning))]/10',
  },
];

export function Features() {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
            Features
          </Badge>
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
              className={`group card-spotlight border-transparent bg-gradient-to-b ${feature.gradient} hover-lift animate-fade-in-up`}
              onMouseMove={handleMouseMove}
              style={{ animationDelay: `${index * 80}ms` }}
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
                <p className="mt-2 text-xs font-medium text-[hsl(var(--primary))]">
                  {feature.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
