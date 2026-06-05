import { Badge } from '@edutech/ui';
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
    description: 'Build dynamic, responsive web applications with modern frameworks.',
    trending: true,
    image:
      'https://images.unsplash.com/photo-1547658719-da2b51169166?w=500&h=350&fit=crop',
    imageAlt: 'Web developer coding on multiple screens',
  },
  {
    icon: Database,
    name: 'Data Science',
    count: '20+',
    description: 'Uncover insights and drive data-driven decisions with Python & ML.',
    trending: true,
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=350&fit=crop',
    imageAlt: 'Data analyst working with charts and dashboards',
  },
  {
    icon: Smartphone,
    name: 'Mobile Development',
    count: '15+',
    description: 'Create engaging native and cross-platform apps for mobile devices.',
    trending: false,
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=350&fit=crop',
    imageAlt: 'Mobile app developer testing an app on a phone',
  },
  {
    icon: Briefcase,
    name: 'Business',
    count: '10+',
    description: 'Master tech-driven business strategies and product management.',
    trending: false,
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=350&fit=crop&crop=faces',
    imageAlt: 'Professional presenting business strategy to a team',
  },
  {
    icon: Palette,
    name: 'UI/UX Design',
    count: '12+',
    description: 'Craft intuitive and beautiful user experiences with modern tools.',
    trending: false,
    image:
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500&h=350&fit=crop',
    imageAlt: 'Designer sketching UI wireframes on a tablet',
  },
  {
    icon: BarChart3,
    name: 'Analytics',
    count: '18+',
    description: 'Interpret data to optimize performance, growth, and user engagement.',
    trending: false,
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=350&fit=crop',
    imageAlt: 'Analytics dashboard showing performance metrics',
  },
];

export function CourseCategories() {
  return (
    <section id="courses" className="relative px-4 py-24 sm:px-6 lg:px-8">
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
            Courses
          </Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Explore our{' '}
            <span className="gradient-text">popular courses</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[hsl(var(--muted-foreground))]">
            Find your passion and accelerate your career with expert-led courses.
          </p>
        </div>

        {/* Category grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, index) => (
            <div
              key={cat.name}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Image */}
              <div className="img-zoom relative aspect-[16/10] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.imageAlt}
                  className="h-full w-full object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--card))] via-[hsl(var(--card)/0.3)] to-transparent" />

                {/* Trending badge */}
                {cat.trending && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-[hsl(var(--warning))] px-2.5 py-1 text-xs font-semibold text-white shadow-md">
                    <TrendingUp size={12} />
                    Trending
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="relative p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.08)]">
                    <cat.icon
                      size={20}
                      className="text-[hsl(var(--primary))]"
                    />
                  </div>
                  <Badge variant="outline" className="px-2.5 py-0.5">
                    {cat.count} courses
                  </Badge>
                </div>

                <h3 className="font-heading text-lg font-bold">{cat.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {cat.description}
                </p>

                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--primary))] opacity-60 transition-all duration-300 group-hover:gap-2.5 group-hover:opacity-100">
                  Explore courses
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
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
