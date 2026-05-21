import { UserPlus, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import { Badge } from '@edutech/ui';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Create Your Account',
    description: 'Sign up in seconds and explore our platform.',
    accent: 'primary',
  },
  {
    icon: BookOpen,
    step: '02',
    title: 'Choose Your Course',
    description: 'Browse live courses in Software, Data, and more.',
    accent: 'accent',
  },
  {
    icon: GraduationCap,
    step: '03',
    title: 'Start Live Learning',
    description: 'Dive into interactive classes and build real skills.',
    accent: 'primary',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
            How it works
          </Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Your Path to{' '}
            <span className="text-[hsl(var(--primary))]">Tech Mastery</span>
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Simple steps to unlock your potential.
          </p>
        </div>

        {/* Steps with animated connector */}
        <div className="relative mt-16">
          {/* Animated connector line (desktop) */}
          <div className="absolute left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] top-[3.25rem] hidden h-0.5 sm:block">
            <div className="h-full w-full bg-gradient-to-r from-[hsl(var(--primary))]/30 via-[hsl(var(--border))] to-[hsl(var(--primary))]/30" />
            <div className="absolute inset-0 overflow-hidden">
              <div className="h-full w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-[hsl(var(--primary))]/40 to-transparent" />
            </div>
          </div>

          <div className="grid gap-12 sm:grid-cols-3 sm:gap-8">
            {steps.map((item, index) => (
              <div
                key={item.step}
                className="animate-fade-in-up relative text-center"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Step icon with ring */}
                <div className="relative mx-auto mb-8 inline-flex">
                  <div className={`relative flex h-[6.5rem] w-[6.5rem] items-center justify-center rounded-2xl ${
                    item.accent === 'primary'
                      ? 'bg-gradient-to-br from-[hsl(var(--primary))]/15 to-[hsl(var(--primary))]/5'
                      : 'bg-gradient-to-br from-[hsl(var(--accent))]/15 to-[hsl(var(--accent))]/5'
                  } ring-2 ${
	                    item.accent === 'primary' ? 'ring-[hsl(var(--primary))]/20' : 'ring-[hsl(var(--accent))]/20'
	                  } transition-all duration-300 hover:shadow-lg hover:ring-[hsl(var(--primary))]/30`}>
                    <item.icon
                      size={30}
                      className={
                        item.accent === 'primary'
                          ? 'text-[hsl(var(--primary))]'
                          : 'text-[hsl(var(--accent))]'
                      }
                    />
                  </div>
                  {/* Step number badge */}
                  <span className={`absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shadow-md ${
                    item.accent === 'primary'
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                  }`}>
                    {item.step}
                  </span>
                </div>

                {/* Arrow connector (mobile) */}
                {index < steps.length - 1 && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[hsl(var(--border))] sm:hidden">
                    <ArrowRight size={20} className="rotate-90" />
                  </div>
                )}

                {/* Step content */}
                <h3 className="font-heading text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
