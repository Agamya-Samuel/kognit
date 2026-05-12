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
    count: 24,
    color: 'teal' as const,
    description: 'HTML, CSS, React, Next.js and modern frontend frameworks.',
    trending: true,
  },
  {
    icon: Database,
    name: 'Data Science',
    count: 18,
    color: 'violet' as const,
    description: 'Python, machine learning, data analysis, and AI fundamentals.',
    trending: true,
  },
  {
    icon: Smartphone,
    name: 'Mobile Development',
    count: 12,
    color: 'amber' as const,
    description: 'React Native, Flutter, and cross-platform mobile apps.',
    trending: false,
  },
  {
    icon: Briefcase,
    name: 'Business & MBA',
    count: 15,
    color: 'rose' as const,
    description: 'Marketing, finance, entrepreneurship, and management skills.',
    trending: false,
  },
  {
    icon: Palette,
    name: 'Design & UI/UX',
    count: 10,
    color: 'pink' as const,
    description: 'Figma, visual design, user research, and prototyping.',
    trending: false,
  },
  {
    icon: BarChart3,
    name: 'Analytics',
    count: 8,
    color: 'cyan' as const,
    description: 'Excel, SQL, Tableau, and business intelligence tools.',
    trending: false,
  },
];

const colorClasses = {
  teal: {
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
    iconText: 'text-teal-600 dark:text-teal-400',
    hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-700',
    glow: 'group-hover:shadow-teal-500/10',
  },
  violet: {
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconText: 'text-violet-600 dark:text-violet-400',
    hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-700',
    glow: 'group-hover:shadow-violet-500/10',
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconText: 'text-amber-600 dark:text-amber-400',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
    glow: 'group-hover:shadow-amber-500/10',
  },
  rose: {
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconText: 'text-rose-600 dark:text-rose-400',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700',
    glow: 'group-hover:shadow-rose-500/10',
  },
  pink: {
    iconBg: 'bg-pink-100 dark:bg-pink-900/30',
    iconText: 'text-pink-600 dark:text-pink-400',
    hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-700',
    glow: 'group-hover:shadow-pink-500/10',
  },
  cyan: {
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-700',
    glow: 'group-hover:shadow-cyan-500/10',
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
  return (
    <section id="courses" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full bg-[hsl(var(--primary))]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
            Courses
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Explore{' '}
            <span className="text-gradient">course categories</span>
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            From coding to business, find the right path for your career goals.
          </p>
        </div>

        {/* Category grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, index) => (
            <Card
              key={cat.name}
              className={`group cursor-pointer border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colorClasses[cat.color].glow} ${colorClasses[cat.color].hoverBorder} animate-fade-in-up`}
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
                <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--primary))] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  Explore courses
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View all button */}
        <div className="mt-12 text-center">
          <Button variant="outline" className="gap-2 rounded-full px-8">
            View All Courses
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
