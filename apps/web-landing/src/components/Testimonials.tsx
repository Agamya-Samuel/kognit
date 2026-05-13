import { Card, CardContent, Avatar } from '@edutech/ui';
import { Star, Award, Users, BookOpen } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'B.Tech CSE, IIT Delhi',
    fallback: 'PS',
    quote:
      'The live classes made complex topics so easy to understand. I landed my first internship at a top startup after completing the web development track.',
    rating: 5,
    highlight: true,
  },
  {
    name: 'Arjun Patel',
    role: 'MBA, IIM Ahmedabad',
    fallback: 'AP',
    quote:
      'The business courses are incredibly practical. Real case studies, real projects. This is what students actually need.',
    rating: 5,
    highlight: false,
  },
  {
    name: 'Sneha Reddy',
    role: 'B.Sc Data Science, BITS Pilani',
    fallback: 'SR',
    quote:
      'The community and mentorship is what sets EduTech apart. I always had someone to guide me when I got stuck on a problem.',
    rating: 5,
    highlight: false,
  },
];

const stats = [
  { icon: Users, value: '2,500+', label: 'Active Students' },
  { icon: Star, value: '4.9/5', label: 'Average Rating' },
  { icon: BookOpen, value: '87+', label: 'Courses' },
  { icon: Award, value: '95%', label: 'Completion Rate' },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-[hsl(var(--muted))]/50 px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full bg-[hsl(var(--primary))]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
            Testimonials
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by students{' '}
            <span className="text-gradient">everywhere</span>
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Hear from students who transformed their skills with EduTech.
          </p>
        </div>

        {/* Social proof stats bar */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="animate-fade-in-up rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-center transition-all duration-200 hover:shadow-md"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <stat.icon
                size={22}
                className="mx-auto mb-2 text-[hsl(var(--primary))]"
              />
              <p className="font-heading text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <Card
              key={t.name}
              className={`relative border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up ${
                t.highlight ? 'ring-1 ring-[hsl(var(--primary))]/20' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                {/* Large decorative quote mark */}
                <div className="absolute -top-4 right-6 text-6xl font-serif leading-none text-[hsl(var(--primary))]/10">
                  &ldquo;
                </div>

                {/* Star rating */}
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-[hsl(var(--warning))] text-[hsl(var(--warning))]"
                    />
                  ))}
                </div>

                {/* Quote text */}
                <p className="relative text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3 border-t border-[hsl(var(--border))] pt-4">
                  <Avatar fallback={t.fallback} size="sm" />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {t.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
