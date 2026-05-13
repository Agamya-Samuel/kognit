import { Button } from '@edutech/ui';
import { ArrowRight, Sparkles, Users } from 'lucide-react';

export function CTA() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="gradient-cta relative overflow-hidden rounded-3xl px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          {/* Background decorative elements */}
          <div className="pointer-events-none absolute inset-0">
            {/* Large gradient orbs */}
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            {/* Small accent dots */}
            <div className="absolute left-[15%] top-[20%] h-2 w-2 rounded-full bg-white/30 animate-float" />
            <div className="absolute right-[20%] bottom-[30%] h-1.5 w-1.5 rounded-full bg-white/20 animate-float delay-300" />
            <div className="absolute left-[60%] top-[60%] h-1 w-1 rounded-full bg-white/25 animate-float delay-500" />
          </div>

          {/* Subtle grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative z-10">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Sparkles size={14} />
              Join 2,500+ students already learning
            </div>

            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to start your
              <br className="hidden sm:block" /> learning journey?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Join thousands of college students who are building real skills
              with EduTech. No credit card required.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="gap-2 rounded-full border-2 border-white bg-white px-8 font-semibold text-[hsl(var(--primary))] shadow-lg shadow-black/10 transition-all duration-200 hover:bg-white/90 hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-full border-2 border-white/30 bg-transparent px-8 text-white backdrop-blur-sm transition-all duration-200 hover:border-white/60 hover:bg-white/10"
              >
                <Users size={16} />
                View All Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
