import { Card, CardContent, Badge } from '@edutech/ui';
import { Button } from '@edutech/ui';
import {
  Monitor,
  Briefcase,
  Palette,
  Database,
  Smartphone,
  BarChart3,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const categories = [
  {
    icon: Monitor,
    name: 'Web Development',
    count: '30+',
    color: 'teal' as const,
    description: 'Build dynamic, responsive web applications.',
    trending: true,
  },
  {
    icon: Database,
    name: 'Data Science',
    count: '20+',
    color: 'violet' as const,
    description: 'Uncover insights and drive data-driven decisions.',
    trending: true,
  },
  {
    icon: Smartphone,
    name: 'Mobile Development',
    count: '15+',
    color: 'amber' as const,
    description: 'Create engaging apps for Android platforms.',
    trending: false,
  },
  {
    icon: Briefcase,
    name: 'Business',
    count: '10+',
    color: 'rose' as const,
    description: 'Master tech-driven business strategies.',
    trending: false,
  },
  {
    icon: Palette,
    name: 'UI/UX Design',
    count: '12+',
    color: 'pink' as const,
    description: 'Craft intuitive and beautiful user experiences.',
    trending: false,
  },
  {
    icon: BarChart3,
    name: 'Analytics',
    count: '18+',
    color: 'cyan' as const,
    description: 'Interpret data to optimize performance and growth.',
    trending: false,
  },
];

const colorClasses = {
  teal: {
    iconBg: 'bg-[hsl(var(--chart-2)/0.12)]',
    iconText: 'text-[hsl(var(--chart-2))]',
    hoverBorder: 'hover:border-[hsl(var(--chart-2)/0.4)]',
    glow: 'group-hover:shadow-[hsl(var(--chart-2)/0.2)]',
  },
  violet: {
    iconBg: 'bg-[hsl(var(--chart-1)/0.12)]',
    iconText: 'text-[hsl(var(--chart-1))]',
    hoverBorder: 'hover:border-[hsl(var(--chart-1)/0.4)]',
    glow: 'group-hover:shadow-[hsl(var(--chart-1)/0.2)]',
  },
  amber: {
    iconBg: 'bg-[hsl(var(--chart-3)/0.12)]',
    iconText: 'text-[hsl(var(--chart-3))]',
    hoverBorder: 'hover:border-[hsl(var(--chart-3)/0.4)]',
    glow: 'group-hover:shadow-[hsl(var(--chart-3)/0.2)]',
  },
  rose: {
    iconBg: 'bg-[hsl(var(--chart-5)/0.12)]',
    iconText: 'text-[hsl(var(--chart-5))]',
    hoverBorder: 'hover:border-[hsl(var(--chart-5)/0.4)]',
    glow: 'group-hover:shadow-[hsl(var(--chart-5)/0.2)]',
  },
  pink: {
    iconBg: 'bg-[hsl(var(--chart-4)/0.12)]',
    iconText: 'text-[hsl(var(--chart-4))]',
    hoverBorder: 'hover:border-[hsl(var(--chart-4)/0.4)]',
    glow: 'group-hover:shadow-[hsl(var(--chart-4)/0.2)]',
  },
  cyan: {
    iconBg: 'bg-[hsl(var(--chart-2)/0.12)]',
    iconText: 'text-[hsl(var(--chart-2))]',
    hoverBorder: 'hover:border-[hsl(var(--chart-2)/0.4)]',
    glow: 'group-hover:shadow-[hsl(var(--chart-2)/0.2)]',
  },
};

const badgeVariant = {
  teal: 'success' as const,
  violet: 'default' as const,
  amber: 'warning' as const,
  rose: 'destructive' as const,
  pink: 'default' as const,
  cyan: 'success' as const,
};

export function CourseCategories() {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="courses" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
            Courses
          </Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Explore Our{' '}
            <span className="text-[hsl(var(--primary))]">Popular Courses</span>
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Find your passion and accelerate your career.
          </p>
        </div>

        {/* Category grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, index) => (
            <Card
              key={cat.name}
              className={`group card-spotlight cursor-pointer border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colorClasses[cat.color].glow} ${colorClasses[cat.color].hoverBorder} animate-fade-in-up`}
              onMouseMove={handleMouseMove}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="relative">
                    <div
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${colorClasses[cat.color].iconBg}`}
                    >
                      <cat.icon
                        size={26}
                        className={colorClasses[cat.color].iconText}
                      />
                    </div>
                    {cat.trending && (
                      <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]">
                        <TrendingUp size={10} />
                      </div>
                    )}
                  </div>
                  <Badge variant={badgeVariant[cat.color]} className="text-xs">
                    {cat.count} courses
                  </Badge>
                </div>
                <h3 className="font-heading text-lg font-semibold">{cat.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {cat.description}
                </p>
                <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--primary))] opacity-60 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  Explore courses
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View all button */}
        <div className="mt-12 text-center">
          <Button variant="outline" className="gap-2 px-8">
            View All Courses
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
