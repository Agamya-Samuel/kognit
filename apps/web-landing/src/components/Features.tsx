'use client';

import { Badge } from '@edutech/ui';
import { Video, Code2, Users, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: Video,
    title: 'Live Interactive Classes',
    description:
      'Engage directly with expert instructors in real-time. Ask questions, get instant feedback, and stay motivated throughout your learning journey.',
    image:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop',
    imageAlt: 'Instructor teaching a live interactive class to engaged students',
    accent: 'primary',
  },
  {
    icon: Code2,
    title: 'Build Real-World Projects',
    description:
      'Apply your knowledge with practical, hands-on assignments. Develop a professional portfolio that showcases your skills to employers.',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
    imageAlt: 'Developer working on code with multiple monitors showing a project',
    accent: 'accent',
  },
  {
    icon: Users,
    title: 'Expert Mentorship & Community',
    description:
      'Get personalized guidance from industry professionals. Connect with peers, share insights, and grow your professional network.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
    imageAlt: 'Team of students collaborating and discussing ideas together',
    accent: 'warning',
  },
];

const accentClasses: Record<string, { iconBg: string; iconText: string; badge: string }> = {
  primary: {
    iconBg: 'bg-[hsl(var(--primary)/0.1)]',
    iconText: 'text-[hsl(var(--primary))]',
    badge: 'border-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]',
  },
  accent: {
    iconBg: 'bg-[hsl(var(--accent)/0.1)]',
    iconText: 'text-[hsl(var(--accent))]',
    badge: 'border-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))]',
  },
  warning: {
    iconBg: 'bg-[hsl(var(--warning)/0.1)]',
    iconText: 'text-[hsl(var(--warning))]',
    badge: 'border-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]',
  },
};

export function Features() {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="features" className="relative px-4 py-24 sm:px-6 lg:px-8">
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
            Why EduTech
          </Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need to{' '}
            <span className="gradient-text">succeed in tech</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[hsl(var(--muted-foreground))]">
            Our platform combines live learning, hands-on practice, and a
            supportive community to accelerate your career.
          </p>
        </div>

        {/* Feature cards with images */}
        <div className="mt-16 space-y-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`animate-fade-in-up card-spotlight group overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 hover:shadow-xl ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              } lg:flex`}
              onMouseMove={handleMouseMove}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image side */}
              <div className="img-zoom relative lg:w-1/2">
                <Image
                  src={feature.image}
                  alt={feature.imageAlt}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--card)/0.1)] to-transparent" />
              </div>

              {/* Content side */}
              <div className="flex flex-col justify-center p-8 lg:w-1/2 lg:p-12">
                <div className="relative z-10">
                  <div
                    className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accentClasses[feature.accent].iconBg} transition-transform duration-200 group-hover:scale-110`}
                  >
                    <feature.icon
                      size={22}
                      className={accentClasses[feature.accent].iconText}
                    />
                  </div>

                  <h3 className="font-heading text-2xl font-bold sm:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-[hsl(var(--muted-foreground))]">
                    {feature.description}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--primary))] opacity-70 transition-all group-hover:gap-2.5 group-hover:opacity-100">
                    Learn more
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
