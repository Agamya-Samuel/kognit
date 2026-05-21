import { Button } from '@edutech/ui';
import { ArrowRight, Sparkles, Users } from 'lucide-react';

export function CTA() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl bg-[hsl(var(--primary))] px-6 py-16 text-center text-[hsl(var(--primary-foreground))] sm:px-12 sm:py-20">
          {/* Background decorative elements */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[hsl(var(--primary-foreground))/0.1] blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-[hsl(var(--primary-foreground))/0.1] blur-3xl" />
            <div className="absolute left-[15%] top-[20%] h-3 w-3 rounded-full bg-[hsl(var(--primary-foreground))/0.4]" />
            <div className="absolute right-[20%] bottom-[30%] h-2 w-2 rounded-full bg-[hsl(var(--primary-foreground))/0.3]" />
            <div className="absolute left-[60%] top-[60%] h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary-foreground))/0.35]" />
          </div>

          <div className="relative z-10">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--primary-foreground))/0.2] bg-[hsl(var(--primary-foreground))/0.1] px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Sparkles size={14} />
              Ready to Launch?
            </div>

            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Your Future in Tech
              <br className="hidden sm:block" /> Starts Now.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[hsl(var(--primary-foreground))/0.8]">
              Join thousands of ambitious students transforming their careers with
              live, interactive learning. Don&apos;t just learn, build and grow.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="motion-safe:animate-bounce-subtle gap-2 border-2 border-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary-foreground))] px-8 font-semibold text-[hsl(var(--primary))] shadow-lg shadow-black/10 transition-all duration-200 hover:bg-[hsl(var(--primary-foreground))/0.9] hover:shadow-xl"
                aria-label="Enroll today"
              >
                Enroll Today
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-2 border-[hsl(var(--primary-foreground))/0.3] bg-transparent px-8 text-[hsl(var(--primary-foreground))] backdrop-blur-sm transition-all duration-200 hover:border-[hsl(var(--primary-foreground))/0.6] hover:bg-[hsl(var(--primary-foreground))/0.1]"
                aria-label="Explore all courses"
              >
                <Users size={16} />
                Explore All Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
