import {
  Github,
  Twitter,
  Linkedin,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Heart,
} from 'lucide-react';

const quickLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Courses', href: '#courses' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
];

const categories = [
  { label: 'Web Development', href: '#courses' },
  { label: 'Data Science', href: '#courses' },
  { label: 'Mobile Development', href: '#courses' },
  { label: 'Business & MBA', href: '#courses' },
  { label: 'UI/UX Design', href: '#courses' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Policy', href: '#' },
  { label: 'Refund Policy', href: '#' },
];

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
];

export function Footer() {
  return (
    <footer className="relative border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-4 pt-16 pb-8 sm:px-6 lg:px-8">
      {/* Gradient accent line at top */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-[hsl(var(--primary))]" />

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-5">
            <a
              href="#"
              className="inline-flex items-center gap-2.5 font-heading text-xl font-bold"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white shadow-md shadow-[hsl(var(--primary))]/20">
                <GraduationCap size={18} />
              </div>
              <span className="text-[hsl(var(--primary))]">EduTech</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              A live-first learning platform for college students. Build
              real skills with interactive courses, expert mentors, and a
              supportive community.
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-3">
              <a
                href="mailto:hello@edutech.in"
                className="flex items-center gap-2.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
              >
                <Mail size={14} className="shrink-0 text-[hsl(var(--primary))]" />
                hello@edutech.in
              </a>
              <a
                href="tel:+911234567890"
                className="flex items-center gap-2.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
              >
                <Phone size={14} className="shrink-0 text-[hsl(var(--primary))]" />
                +91 123 456 7890
              </a>
              <div className="flex items-center gap-2.5 text-sm text-[hsl(var(--muted-foreground))]">
                <MapPin
                  size={14}
                  className="shrink-0 text-[hsl(var(--primary))]"
                />
                Bengaluru, India
              </div>
            </div>

            {/* Social icons */}
            <div className="mt-6 flex gap-2" role="list" aria-label="Social media links">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  role="listitem"
                  className="hover-lift inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] transition-all hover:border-[hsl(var(--primary))]/30 hover:text-[hsl(var(--primary))] hover:scale-110"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))]">
                Quick Links
              </h4>
              <ul className="mt-4 space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group relative inline-block text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
                    >
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[hsl(var(--primary))] transition-all duration-300 group-hover:w-full" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))]">
                Categories
              </h4>
              <ul className="mt-4 space-y-3">
                {categories.map((cat) => (
                  <li key={cat.label}>
                    <a
                      href={cat.href}
                      className="group relative inline-block text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
                    >
                      {cat.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[hsl(var(--primary))] transition-all duration-300 group-hover:w-full" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))]">
                Legal
              </h4>
              <ul className="mt-4 space-y-3">
                {legalLinks.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="group relative inline-block text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
                    >
                      {item.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[hsl(var(--primary))] transition-all duration-300 group-hover:w-full" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[hsl(var(--border))] pt-6 sm:flex-row">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            &copy; {new Date().getFullYear()} EduTech. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
            Made with
            <Heart
              size={14}
              className="fill-[hsl(var(--destructive))] text-[hsl(var(--destructive))]"
            />
            in India
          </p>
        </div>
      </div>
    </footer>
  );
}
