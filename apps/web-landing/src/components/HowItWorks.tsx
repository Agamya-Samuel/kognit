import { UserPlus, BookOpen, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@edutech/ui';
import Image from 'next/image';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Create Your Account',
    description:
      'Sign up in seconds and explore our extensive course catalog. Tell us your goals and we\'ll personalize your experience.',
    image:
      'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=500&h=350&fit=crop',
    imageAlt: 'Person happily signing up on a laptop at a cozy workspace',
  },
  {
    icon: BookOpen,
    step: '02',
    title: 'Choose Your Course',
    description:
      'Browse live courses in Fullstack, Data Science, Mobile Development, and more. Pick the one that matches your career goals.',
    image:
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=350&fit=crop',
    imageAlt: 'Student browsing through books and digital resources to find the right course',
  },
  {
    icon: GraduationCap,
    step: '03',
    title: 'Start Live Learning',
    description:
      'Dive into interactive live classes, build real projects, and get mentored by industry experts. Graduate with confidence.',
    image:
      'https://images.unsplash.com/photo-1627556704302-624286467c65?w=500&h=350&fit=crop',
    imageAlt: 'Student celebrating graduation achievement with a laptop',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge
            variant="outline"
            className="mb-4 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--primary))]"
          >
            <Sparkles size={12} className="mr-1" />
            How it works
          </Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Your path to{' '}
            <span className="gradient-text">tech mastery</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[hsl(var(--muted-foreground))]">
            Three simple steps to unlock your potential and transform your career.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-20 space-y-24">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className={`animate-fade-in-up flex flex-col items-center gap-10 lg:flex-row lg:gap-16 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Image */}
              <div className="img-zoom relative w-full max-w-md rounded-3xl lg:w-1/2">
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  className="object-cover rounded-3xl shadow-lg"
                />
                {/* Step number overlay badge */}
                <div className="absolute -top-4 -left-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] font-heading text-lg font-bold text-white shadow-xl">
                  {item.step}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.08)]">
                  <item.icon size={22} className="text-[hsl(var(--primary))]" />
                </div>
                <h3 className="font-heading text-2xl font-bold sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {item.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary))]">
                    Next step
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
