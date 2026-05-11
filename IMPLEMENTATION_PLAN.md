# EduTech UI Implementation Plan

**Status**: Ready for Approval  
**Last Updated**: 2026-05-11  
**Prepared by**: v0 AI Assistant

---

## Executive Summary

This document outlines the phased implementation approach for building the EduTech platform's UI based on the design documents (`docs/07-design/`) and your specific requirements. We will build **Shared Auth Pages** first, followed by the **Landing Page**, then the **Student App core pages**.

**Key Decisions Made**:
- ✅ **Phase 1**: Shared Auth Pages (Login, Registration, Email Verification, Password Reset)
- ✅ **Phase 2**: Landing Page (public marketing at `eduplatform.com`)
- ✅ **Phase 3**: Student App (Dashboard, Course Catalog, Course Detail)
- ✅ **Theme**: Light + Dark mode with system preference detection and manual toggle
- ✅ **Mobile Navigation**: Sticky bottom tab with context-aware hiding (video/live class/quiz)
- ✅ **Course Cards**: Show instructor name, ratings, enrollment count, duration/level
- ✅ **Pagination**: Numbered pagination for course listings
- ✅ **Loading States**: Inline skeleton screens (not full-screen overlays)

---

## Design System Reference

### Color Palette (from Design System Doc)

| Token | Color | Usage |
|---|---|---|
| **Primary** | Indigo (`#4F46E5`) | Brand identity, primary buttons, navigation, links |
| **Secondary** | Teal (`#0D9488`) | Success states, progress, badges, coding courses |
| **Accent** | Amber (`#F59E0B`) | CTAs, live class, notifications, premium features |
| **Destructive** | Red (`#EF4444`) | Errors, delete actions, validation failures |
| **Neutrals** | Slate (`#F8FAFC` to `#0F172A`) | Backgrounds, text, borders, surfaces |

### Typography

- **Headings**: Modern, sans-serif (TBD by design)
- **Body**: Clean, readable sans-serif with 1.4-1.6 line height
- **Max 2 fonts**: One for headings, one for body

### Spacing

- Tailwind scale (p-4, gap-6, etc.) — no arbitrary values
- Responsive prefixes (md:, lg:) for mobile-first layout

---

## Phase 1: Shared Auth Pages

### Scope

**Pages to build** (in order):
1. **Login** — Email/password + OAuth (Google, GitHub)
2. **Email Verification** — 6-digit code entry with auto-advance
3. **Registration** — Password + display name with strength indicator
4. **Forgot Password** — Email entry + verification link
5. **Reset Password** — New password entry with confirmation

### Key Specifications

#### 1.1 Login Page

| Attribute | Details |
|---|---|
| **Layout** | Centered card (mobile-first) |
| **Fields** | Email, Password (with show/hide toggle) |
| **Buttons** | Sign In (primary), Google OAuth, GitHub OAuth |
| **Links** | Forgot Password, Create Account |
| **States** | Default, Loading, Error (invalid creds), Error (account locked), Error (deactivated) |
| **Mobile** | Full-width card, stacked OAuth buttons, larger touch targets |

#### 1.2 Email Verification

| Attribute | Details |
|---|---|
| **Layout** | Centered card with mail icon |
| **Input** | 6 individual digit boxes (auto-advance, auto-focus) |
| **Actions** | Verify button, Resend code link with countdown |
| **Display** | Masked email (e.g., "a***@gmail.com") |
| **States** | Default, Loading, Error (wrong code), Error (expired), Success |
| **Interaction** | Tap/type advances to next digit, backspace goes to previous |

#### 1.3 Registration (Set Password + Name)

| Attribute | Details |
|---|---|
| **Layout** | Centered card |
| **Fields** | Display name, Password, Confirm password |
| **Password Indicator** | Visual strength bar (Weak/Fair/Strong) |
| **Requirements** | Min 8 chars, uppercase, lowercase, digit (shown as hint text) |
| **Button** | Create Account (primary) |
| **States** | Default, Loading, Error (password mismatch), Success |

#### 1.4 & 1.5 Password Reset Pages

| Attribute | Details |
|---|---|
| **Forgot Password** | Email input, Send button, "Back to login" link |
| **Reset Password** | Token verification, new password fields, confirm button |
| **States** | Loading, Error (invalid token), Success → redirect to login |

### API Integration Notes

- **Email verification**: 6-digit code sent to user email, expires in 10 minutes
- **Login**: Email/password authentication + OAuth provider redirect
- **Account lockout**: After 5 failed attempts, lock for 15 minutes with email notification
- **Password strength**: Validated on client + server (minimum 8 chars, mixed case, digit)

---

## Phase 2: Landing Page

### Scope

**Pages to build**:
1. **Landing Page Home** — Hero, feature highlights, CTA, testimonials, FAQ

### Key Specifications

- **Hero Section**: Compelling headline, subheading, primary CTA ("Start Free")
- **Feature Cards**: 3-4 key platform benefits with icons
- **Course Preview**: Show 3-4 top courses with thumbnails + instructor info
- **Testimonials**: 2-3 student reviews with photos + names
- **FAQ Section**: Common questions (expandable accordion)
- **Footer**: Links to auth pages, company info, social links
- **Responsive**: Mobile-first, scales beautifully to tablet/desktop

---

## Phase 3: Student App Core Pages

### Scope

**Pages to build**:
1. **Student Dashboard** — Welcome, ongoing courses, quick actions
2. **Course Catalog** — Search + filter, course cards, pagination
3. **Course Detail** — Full course info, instructor profile, enrollment

### Key Specifications

#### 3.1 Dashboard

- **Hero Section**: Welcome message personalized to user
- **Quick Actions**: "Browse Courses", "View My Courses", "Join Live Class"
- **Ongoing Courses**: Latest 3-4 courses user is enrolled in
- **Recommendations**: Algorithm-suggested courses based on interests
- **Bottom Tab Navigation**: Dashboard, Courses, Community, My Learning, Profile (sticky)

#### 3.2 Course Catalog

- **Search Bar**: Search courses by title/category
- **Filter Sidebar**: Category, level, price range (free/paid)
- **Course Grid**: Cards showing:
  - Course thumbnail image
  - Course title
  - Instructor name + profile link
  - ⭐ Rating (star + review count)
  - 📊 Enrollment count (e.g., "2.3K enrolled")
  - 📅 Duration / Difficulty level
  - Price (free or ₹XXX)
- **Pagination**: Numbered (1, 2, 3...) with prev/next buttons
- **Loading**: Inline skeleton cards while fetching

#### 3.3 Course Detail

- **Header**: Course thumbnail, title, rating, instructor
- **Tabs**: Overview, Curriculum, Reviews, FAQs
- **Enroll Button**: Primary CTA (routes to checkout or confirms enrollment)
- **Course Content**: Description, learning outcomes, prerequisites
- **Instructor Profile**: Bio, rating, student count, social links

### Mobile Navigation Behavior

**Bottom tab navigation is STICKY with context-aware hiding**:

```
Normal pages (Dashboard, Catalog):  ✅ Tab bar visible
Video playback:                     ❌ Tab bar hidden
Live class:                         ❌ Tab bar hidden
Quiz/Assessment:                    ❌ Tab bar hidden
Scrolling up content:               ✅ Tab bar visible
Scrolling down content:             ✅ Tab bar visible (doesn't auto-hide)
```

---

## Design Tokens Implementation

### CSS Variables (Light Mode)

All tokens are in `/packages/ui/src/globals.css` using `oklch` color space:

```css
:root {
  /* Surfaces */
  --background: oklch(0.985 0.002 247);       /* slate-50 */
  --foreground: oklch(0.208 0.042 265);       /* slate-900 */
  --card: oklch(1 0 0);                       /* white */
  
  /* Brand */
  --primary: oklch(0.457 0.24 277);           /* indigo-600 */
  --secondary: oklch(0.968 0.007 264);        /* slate-100 */
  --accent: oklch(0.623 0.146 180);           /* teal-500 */
  --destructive: oklch(0.577 0.238 10.45);    /* red-500 */
  
  /* Support */
  --muted: oklch(0.968 0.007 264);
  --muted-foreground: oklch(0.554 0.022 257);
  --border: oklch(0.903 0.01 264);
  --input: oklch(1 0 0);
  --ring: oklch(0.457 0.24 277);
  
  /* Radius */
  --radius: 0.625rem;
}
```

### Dark Mode Tokens

`@media (prefers-color-scheme: dark)` will override with dark variants (darker backgrounds, lighter text, adjusted contrasts).

---

## Component Specifications

### Shared Components

| Component | Purpose | Notes |
|---|---|---|
| **Button** | Primary, secondary, tertiary variants | Large touch targets on mobile |
| **Input** | Text, email, password fields | Show/hide for passwords |
| **Card** | Content containers | Subtle shadows, rounded corners |
| **Modal/Dialog** | Confirmations, alerts | Full-screen on mobile |
| **Toast** | Success/error messages | Bottom-right, auto-dismiss |
| **Skeleton** | Loading placeholders | Match component shapes |
| **Pagination** | Page navigation | Prev/Next + number buttons |
| **Avatar** | User profiles | Initials fallback |
| **Badge** | Tags, labels, categories | Color-coded (teal/indigo/amber) |

### Form Components

- **Password Strength Indicator**: Bar visual (weak → fair → strong)
- **Digit Input**: 6-box password entry with auto-advance
- **OTP Timer**: "Resend in MM:SS" countdown
- **Checkbox/Radio**: Styled with brand colors

---

## Accessibility & Mobile Considerations

### Accessibility

- ✅ WCAG AA contrast ratios (4.5:1 for text, 3:1 for components)
- ✅ Semantic HTML (buttons, inputs, labels, landmarks)
- ✅ ARIA labels for icons and empty states
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Screen reader support for form errors and loading states

### Mobile Optimization

- ✅ Touch targets minimum 48×48px
- ✅ Full-width inputs on small screens
- ✅ Stacked buttons (not side-by-side) on mobile
- ✅ Large font sizes (16px minimum for inputs to prevent zoom)
- ✅ No horizontal scrolling
- ✅ Optimized images (WebP, lazy load)

### Dark Mode

- ✅ System preference detection (prefers-color-scheme)
- ✅ Manual toggle in settings (persisted in localStorage or DB)
- ✅ Smooth transitions between themes
- ✅ No brightness/contrast issues in dark mode

---

## Implementation Order (Week-by-Week Estimate)

| Week | Focus | Deliverable |
|---|---|---|
| **Week 1** | Auth Pages (Login, Verification, Registration) | 3 pages built + tested |
| **Week 2** | Password Reset + Landing Page Hero | 2 pages + hero section |
| **Week 3** | Landing Page (features, testimonials, FAQ) | Full landing page |
| **Week 4** | Student Dashboard + Setup mobile nav | Dashboard + tab bar |
| **Week 5** | Course Catalog + Pagination | Catalog with skeleton loading |
| **Week 6** | Course Detail + Polish | Detail page + refinement |

---

## Tech Stack & Dependencies

### Frontend Framework
- **Next.js 16** (App Router)
- **React 19.2**
- **TypeScript**

### UI & Styling
- **Tailwind CSS** (with custom design tokens)
- **ShadCN UI** (for base components)
- **React Icons** (for iconography)

### Form & Validation
- **React Hook Form** (form state management)
- **Zod** (schema validation)

### HTTP & State
- **SWR** (data fetching, caching, client-side state)
- **Axios** (HTTP client)

### Dark Mode
- **next-themes** (theme switching with persistence)

---

## Known Ambiguities & Decisions

| Question | Decision | Rationale |
|---|---|---|
| How to display instructor avatars on course cards? | Use placeholder gradient if not available | Faster load, better UX than blank space |
| Should course cards be clickable anywhere or just title? | Entire card clickable | Better mobile UX, larger touch target |
| What happens after successful registration? | Auto-login + redirect to dashboard | Seamless onboarding experience |
| Should "Forgot Password" email show loading state? | Yes, 3-second fake delay then success message | Realistic UX, prevents double-submit |
| How many course cards per page? | 12 courses (4 cols on desktop, 2 on mobile) | Balanced pagination |

---

## Next Steps

### Before Implementation Starts

1. ✅ **Approve this plan** — Confirm all phases, decisions, and specs
2. **Clarify any ambiguities** — Ask questions about specific components or behaviors
3. **Review design tokens** — Ensure color palette aligns with brand vision

### During Implementation

1. Create a shared UI component library (`@eduplatform/ui`)
2. Set up design tokens (colors, typography, spacing)
3. Build auth pages with form validation
4. Set up routing and navigation structure
5. Build landing page sections
6. Build student dashboard and course catalog
7. Implement dark mode throughout
8. Test on mobile devices (iOS Safari, Android Chrome)
9. Run accessibility audit (Axe DevTools, WAVE)

### Quality Checklist (Per Page)

- [ ] Responsive on mobile (320px) and desktop (1440px)
- [ ] Dark mode tested and visually balanced
- [ ] Loading states visible (skeletons, spinners)
- [ ] Error states handled with clear messages
- [ ] WCAG AA accessibility passed (Axe audit)
- [ ] Touch targets 48×48px minimum on mobile
- [ ] Images optimized (WebP, lazy loaded)
- [ ] No console errors or warnings

---

## Questions for You

Before we start building, please confirm:

1. **App domains**: Should we use `student.eduplatform.com` or a different structure?
2. **Images**: Do you have course thumbnail images, instructor avatars, or should we use generated placeholders?
3. **API endpoints**: Are the backend APIs ready, or should we mock data for now?
4. **User testing**: Will you want usability testing after Phase 1, or after all phases?
5. **Git workflow**: Should we create feature branches or push to main? (Note: Current branch is `ui-design-clarification`)

---

**Status**: ✅ Ready for approval — Please review and provide feedback before implementation begins.
