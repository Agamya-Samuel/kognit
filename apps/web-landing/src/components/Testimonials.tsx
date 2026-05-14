import { Card, CardContent, Avatar } from '@edutech/ui';
import { Star, Award, Users, BookOpen } from 'lucide-react';

const testimonials = [
  {
    name: 'Aisha Khan',
    role: 'Computer Science, Tech University',
    fallback: 'AK',
    quote:
      "EduTech's live classes transformed my coding skills. The mentors are incredibly supportive, and the hands-on projects helped me land a competitive internship.",
    rating: 5,
    highlight: true,
  },
  {
    name: 'Rahul Sharma',
    role: 'Statistics Major, Premier Institute',
    fallback: 'RS',
    quote:
      'I learned more about Data Science here than in my entire degree. The practical approach and immediate feedback truly accelerate learning. Highly recommend!',
    rating: 5,
    highlight: false,
  },
  {
    name: 'Priya Singh',
    role: 'Electronics Eng., Engineering College',
    fallback: 'PS',
    quote:
      'The Android Development course was fantastic. Building my own app in live sessions was challenging yet incredibly rewarding. My confidence has skyrocketed.',
    rating: 5,
    highlight: false,
  },
];

const stats = [
  { icon: Users, value: '25K+', label: 'Students Taught' },
  { icon: Star, value: '4.9/5', label: 'Average Rating' },
  { icon: BookOpen, value: '100+', label: 'Live Courses' },
  { icon: Award, value: '92%', label: 'Course Completion' },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="gradient-radial px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full bg-[hsl(var(--primary))]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
            Testimonials
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Hear From Our{' '}
            <span className="text-gradient">Successful</span>{' '}
            Students
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Real stories from those transforming their careers.
          </p>
        </div>

        {/* Social proof stats bar */}
        <div className="gradient-border mt-14 rounded-2xl p-px">
        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-[hsl(var(--card))] p-4 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="animate-fade-in-up rounded-xl p-5 text-center transition-all duration-200 hover:shadow-md"
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
        </div>

        {/* Testimonial cards */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <Card
              key={t.name}
              className={`relative border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up ${
                t.highlight ? 'ring-2 ring-[hsl(var(--primary))]/30 shadow-lg shadow-[hsl(var(--primary))]/10' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                {/* Large decorative quote mark */}
                <div className="absolute -top-4 right-6 text-7xl font-serif leading-none text-[hsl(var(--primary))]/15">
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
