import { Button } from '@edutech/ui';
import { ArrowRight, Sparkles, Users } from 'lucide-react';

export function CTA() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl bg-[hsl(var(--primary))] px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          {/* Background decorative elements */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute left-[15%] top-[20%] h-3 w-3 rounded-full bg-white/40" />
            <div className="absolute right-[20%] bottom-[30%] h-2 w-2 rounded-full bg-white/30" />
            <div className="absolute left-[60%] top-[60%] h-1.5 w-1.5 rounded-full bg-white/35" />
          </div>

          <div className="relative z-10">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Sparkles size={14} />
              Ready to Launch?
            </div>

            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Your Future in Tech
              <br className="hidden sm:block" /> Starts Now.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Join thousands of ambitious students transforming their careers with
              live, interactive learning. Don&apos;t just learn, build and grow.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="motion-safe:animate-bounce-subtle gap-2 border-2 border-white bg-white px-8 font-semibold text-[hsl(var(--primary))] shadow-lg shadow-black/10 transition-all duration-200 hover:bg-white/90 hover:shadow-xl"
                aria-label="Enroll today"
              >
                Enroll Today
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-2 border-white/30 bg-transparent px-8 text-white backdrop-blur-sm transition-all duration-200 hover:border-white/60 hover:bg-white/10"
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
