import { Badge } from '@edutech/ui';
import { Star, Award, Users, BookOpen, Quote } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Aisha Khan',
    role: 'Computer Science, Tech University',
    photo:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    quote:
      "EduTech's live classes transformed my coding skills. The mentors are incredibly supportive, and the hands-on projects helped me land a competitive internship at a top tech company.",
    rating: 5,
    highlight: true,
  },
  {
    name: 'Rahul Sharma',
    role: 'Statistics Major, Premier Institute',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    quote:
      'I learned more about Data Science here than in my entire degree. The practical approach and immediate feedback truly accelerate learning. Highly recommend to anyone serious about data!',
    rating: 5,
    highlight: false,
  },
  {
    name: 'Priya Singh',
    role: 'Electronics Eng., Engineering College',
    photo:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
    quote:
      'The Android Development course was fantastic. Building my own app in live sessions was challenging yet incredibly rewarding. My confidence has skyrocketed since joining.',
    rating: 5,
    highlight: false,
  },
];

const stats = [
  { icon: Users, value: '25K+', label: 'Students Taught' },
  { icon: Star, value: '4.9/5', label: 'Average Rating' },
  { icon: BookOpen, value: '120+', label: 'Live Courses' },
  { icon: Award, value: '95%', label: 'Course Completion' },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge
            variant="outline"
            className="mb-4 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--primary))]"
          >
            Testimonials
          </Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Hear from our{' '}
            <span className="gradient-text">successful students</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[hsl(var(--muted-foreground))]">
            Real stories from real people transforming their careers with EduTech.
          </p>
        </div>

        {/* Social proof stats bar */}
        <div className="mt-14 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="animate-fade-in-up text-center"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <stat.icon
                  size={24}
                  className="mx-auto mb-2 text-[hsl(var(--primary))]"
                />
                <p className="font-heading text-3xl font-bold">{stat.value}</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial cards */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <div
              key={t.name}
              className={`group relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up ${
                t.highlight
                  ? 'ring-2 ring-[hsl(var(--primary)/0.2)] shadow-lg shadow-[hsl(var(--primary)/0.08)]'
                  : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Decorative quote mark */}
              <Quote
                size={40}
                className="absolute top-4 right-4 text-[hsl(var(--primary)/0.08)]"
              />

              {/* Star rating */}
              <div className="mb-4 flex gap-0.5" role="img" aria-label={`Rated ${t.rating} out of 5 stars`}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-[hsl(var(--warning))] text-[hsl(var(--warning))]"
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Quote text */}
              <p className="relative text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-[hsl(var(--border))] pt-4">
                <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-[hsl(var(--primary)/0.15)]">
                  <Image
                    src={t.photo}
                    alt={t.name}
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
