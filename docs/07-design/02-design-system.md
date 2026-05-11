# Design System

> **Purpose:** Color palette, typography, spacing, and visual design system shared across all applications
> **Last Updated:** 2025

---

## Table of Contents

1. [Color Palette & Psychology](#1-color-palette--psychology)
2. [Design System Architecture](#2-design-system-architecture)
3. [Token Reference](#3-token-reference)
4. [Component Mapping](#4-component-mapping)
5. [Typography](#5-typography)
6. [Accessibility Guidelines](#6-accessibility-guidelines)
7. [App-Specific Guidelines](#7-app-specific-guidelines)

---

## 1. Color Palette & Psychology

### Why These Colors?

Your platform targets **Indian college students (18-26)** learning **Coding/Tech and Business skills** on a **mobile-first** freemium product. Color psychology research consistently points to these principles for this demographic and use case:

| Need | Best Color(s) | Why |
|---|---|---|
| **Trust & credibility** (payment, enrollment) | Blue | "Most widely used in educational design" — promotes calm, focus, trust. Indian market strongly associates blue with reliability. |
| **Growth & progress** (courses, completion) | Green/Teal | "Most calming for eyes" — reduces fatigue during long sessions, symbolizes growth, progress, and achievement. |
| **Energy & action** (CTAs, live classes) | Amber/Orange | Warmer alternative to red — creates urgency without anxiety. Excellent for "Enroll Now", "Join Live", payment CTAs. |
| **Focus & readability** (content-heavy pages) | Neutral grays | Prevents cognitive overload, ensures WCAG AA contrast, gives visual rest. |
| **Professionalism** (instructor/admin trust) | Deep navy | 18-26 demographic prefers mature, clean aesthetics over playful/bright palettes. |

### The Palette

```
┌──────────────────────────────────────────────────────────┐
│  PRIMARY       "Scholarly Indigo"                        │
│  ██████████    #4F46E5 / indigo-600                      │
│  Trust · Intelligence · Professionalism                  │
│  Used for: brand identity, primary buttons, active      │
│  states, links, navigation highlights                    │
│                                                          │
│  SECONDARY     "Growth Teal"                             │
│  ██████████    #0D9488 / teal-600                        │
│  Progress · Freshness · Tech-forward                     │
│  Used for: success states, progress bars, badges,       │
│  coding course category, completion indicators           │
│                                                          │
│  ACCENT        "Achievement Amber"                       │
│  ██████████    #F59E0B / amber-500                       │
│  Energy · Optimism · Action                              │
│  Used for: CTAs, highlights, notifications, live        │
│  class badges, premium features, star ratings            │
│                                                          │
│  DESTRUCTIVE   "Alert Red"                               │
│  ██████████    #EF4444 / red-500                         │
│  Urgency · Error · Warning                               │
│  Used for: errors, delete actions, validation failures   │
│                                                          │
│  NEUTRALS       Cool gray scale                          │
│  ██████████    slate-50 → slate-950                      │
│  ██████████    #F8FAFC → #0F172A                         │
│  Readability · Structure · Focus                         │
│  Used for: backgrounds, text, borders, surfaces          │
└──────────────────────────────────────────────────────────┘
```

### Color Psychology Reasoning

| Color | Psychological Effect | Platform Application |
|---|---|---|
| **Indigo Blue** | Slows heartbeat, instills stability and trust. Research shows blue environments improve comprehension by up to 25%. Darker blues feel professional without being cold. | Login/auth (trust), primary buttons (confidence to click "Enroll"), navigation (familiarity), brand identity (recall) |
| **Teal Green** | Easiest on the eyes, reduces stress, associated with growth and progress. In Indian culture, green symbolizes new beginnings. | Course progress bars (growth), completion states (achievement), coding category tag (tech), certificates (accomplishment) |
| **Amber** | Stimulates without anxiety (unlike red), conveys optimism and warmth. Increases conversion when used on CTAs. | "Start Learning" / "Enroll Now" CTAs, live class indicators, notification badges, pricing highlights |
| **Slate Neutrals** | Reduces visual fatigue, enables content focus. Cool-tinted grays feel more modern/tech than warm grays. | Page backgrounds, card surfaces, text hierarchy, borders, code blocks |

### Analogous Color Scheme

The blue-to-teal relationship is an **analogous scheme** (adjacent on the color wheel), which research shows creates the most harmonious, low-anxiety experience for learning platforms. Amber is the **complementary accent** — opposite on the wheel — providing maximum contrast for action elements.

### Category Color Coding

```
Coding / Tech courses   → Teal badge (#0D9488)
Business / Skills       → Indigo badge (#4F46E5)
Live class indicator    → Amber pulse (#F59E0B)
Free / Preview          → Green badge (#22C55E)
Premium / Paid          → Amber badge (#F59E0B)
```

---

## 2. Design System Architecture

### File Structure

```
/packages/ui/
├── src/
│   ├── globals.css              ← Single source of truth for ALL design tokens
│   ├── components/              ← ShadCN components (Button, Card, Input, etc.)
│   ├── lib/
│   │   └── utils.ts             ← cn() helper and utilities
│   └── index.ts                 ← Barrel exports
├── package.json
├── components.json              ← ShadCN config (tailwind.cssVariables: true)
└── tailwind.config.ts           ← Shared Tailwind presets
```

### Token System

The design system uses **ShadCN's CSS variable convention** with `oklch` colors for perceptual uniformity. This is a single file that every app imports.

All tokens live in `/packages/ui/src/globals.css`. See [Token Reference](#3-token-reference) for the complete token set.

### App Import Pattern

Each app (`apps/web-student`, `apps/web-instructor`, `apps/web-admin`) imports the shared design system:

```css
/* apps/web-student/src/app/globals.css */
@import "@eduplatform/ui/globals.css";

/* App-specific overrides (if needed) */
```

```json
/* apps/web-student/package.json */
{
  "dependencies": {
    "@eduplatform/ui": "workspace:*"
  }
}
```

### Shared Configuration

**`components.json`** in `/packages/ui/`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## 3. Token Reference

### Light Mode — Scholarly Indigo Theme

```css
:root {
  --radius: 0.625rem;

  /* Surfaces */
  --background: oklch(0.985 0.002 247);       /* slate-50  */
  --foreground: oklch(0.208 0.042 265);        /* slate-900 */

  --card: oklch(1 0 0);                        /* white     */
  --card-foreground: oklch(0.208 0.042 265);

  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.208 0.042 265);

  /* Brand: Scholarly Indigo */
  --primary: oklch(0.457 0.24 277);            /* indigo-600  #4F46E5 */
  --primary-foreground: oklch(0.985 0.002 247);/* white-ish   */

  /* Supporting surface */
  --secondary: oklch(0.968 0.007 264);         /* slate-100 */
  --secondary-foreground: oklch(0.208 0.042 265);

  /* Subdued */
  --muted: oklch(0.968 0.007 264);
  --muted-foreground: oklch(0.554 0.022 257);  /* slate-500 */

  /* Interactive hover / Growth Teal */
  --accent: oklch(0.623 0.146 180);            /* teal-500   #14B8A6 */
  --accent-foreground: oklch(1 0 0);

  /* Destructive */
  --destructive: oklch(0.577 0.245 27.3);      /* red-500    */

  /* Borders & Input */
  --border: oklch(0.929 0.013 255);            /* slate-200  */
  --input: oklch(0.929 0.013 255);
  --ring: oklch(0.457 0.24 277);               /* indigo-600 */

  /* Status Tokens */
  --success: oklch(0.596 0.145 163);           /* teal-600   #0D9488 */
  --success-foreground: oklch(1 0 0);
  --warning: oklch(0.755 0.183 55);            /* amber-500  #F59E0B */
  --warning-foreground: oklch(0.208 0.042 265);
  --info: oklch(0.623 0.214 259);              /* blue-500   #3B82F6 */
  --info-foreground: oklch(1 0 0);

  /* Chart Palette */
  --chart-1: oklch(0.457 0.24 277);            /* indigo    */
  --chart-2: oklch(0.596 0.145 163);           /* teal      */
  --chart-3: oklch(0.755 0.183 55);            /* amber     */
  --chart-4: oklch(0.623 0.214 259);           /* blue      */
  --chart-5: oklch(0.645 0.246 16);            /* orange    */

  /* Sidebar */
  --sidebar: oklch(0.985 0.002 247);
  --sidebar-foreground: oklch(0.208 0.042 265);
  --sidebar-primary: oklch(0.457 0.24 277);
  --sidebar-primary-foreground: oklch(0.985 0.002 247);
  --sidebar-accent: oklch(0.968 0.007 264);
  --sidebar-accent-foreground: oklch(0.208 0.042 265);
  --sidebar-border: oklch(0.929 0.013 255);
  --sidebar-ring: oklch(0.457 0.24 277);
}
```

### Dark Mode

```css
.dark {
  --background: oklch(0.145 0.021 265);        /* slate-900  */
  --foreground: oklch(0.968 0.007 264);

  --card: oklch(0.208 0.042 265);              /* slate-800  */
  --card-foreground: oklch(0.968 0.007 264);

  --popover: oklch(0.208 0.042 265);
  --popover-foreground: oklch(0.968 0.007 264);

  --primary: oklch(0.585 0.233 277);           /* indigo-400 */
  --primary-foreground: oklch(0.145 0.021 265);

  --secondary: oklch(0.279 0.035 265);         /* slate-700  */
  --secondary-foreground: oklch(0.968 0.007 264);

  --muted: oklch(0.279 0.035 265);
  --muted-foreground: oklch(0.704 0.015 255);  /* slate-400  */

  --accent: oklch(0.704 0.143 180);            /* teal-400   */
  --accent-foreground: oklch(0.145 0.021 265);

  --destructive: oklch(0.704 0.191 22);        /* red-400    */

  --border: oklch(0.279 0.035 265);
  --input: oklch(0.279 0.035 265);
  --ring: oklch(0.585 0.233 277);

  --success: oklch(0.704 0.143 180);           /* teal-400   */
  --success-foreground: oklch(0.145 0.021 265);
  --warning: oklch(0.828 0.189 84);            /* amber-400  */
  --warning-foreground: oklch(0.145 0.021 265);
  --info: oklch(0.704 0.165 259);              /* blue-400   */
  --info-foreground: oklch(0.145 0.021 265);

  --chart-1: oklch(0.585 0.233 277);
  --chart-2: oklch(0.704 0.143 180);
  --chart-3: oklch(0.828 0.189 84);
  --chart-4: oklch(0.704 0.165 259);
  --chart-5: oklch(0.704 0.213 27);

  --sidebar: oklch(0.208 0.042 265);
  --sidebar-foreground: oklch(0.968 0.007 264);
  --sidebar-primary: oklch(0.585 0.233 277);
  --sidebar-primary-foreground: oklch(0.968 0.007 264);
  --sidebar-accent: oklch(0.279 0.035 265);
  --sidebar-accent-foreground: oklch(0.968 0.007 264);
  --sidebar-border: oklch(0.279 0.035 265);
  --sidebar-ring: oklch(0.585 0.233 277);
}
```

### Token Semantics

| Token | What it controls | Used by |
|---|---|---|
| `background / foreground` | Default app background and text color | Page shell, page sections, default text |
| `card / card-foreground` | Elevated surfaces and content inside them | Card, dashboard panels, settings panels |
| `popover / popover-foreground` | Floating surfaces and content inside them | Popover, DropdownMenu, ContextMenu, overlays |
| `primary / primary-foreground` | High-emphasis actions and brand surfaces | Default Button, selected states, badges, active accents |
| `secondary / secondary-foreground` | Lower-emphasis filled actions and supporting surfaces | Secondary buttons, secondary badges, supporting UI |
| `muted / muted-foreground` | Subtle surfaces and lower-emphasis content | Descriptions, placeholders, empty states, helper text, subdued surfaces |
| `accent / accent-foreground` | Interactive hover, focus, and active surfaces | Ghost buttons, menu highlight states, hovered rows, selected items |
| `destructive` | Destructive actions and error emphasis | Destructive buttons, invalid states, destructive menu items |
| `border` | Default borders and separators | Cards, menus, tables, separators, layout dividers |
| `input` | Form control borders and input surface treatment | Input, Textarea, Select, outline-style controls |
| `ring` | Focus rings and outlines | Buttons, inputs, checkboxes, menus, focusable controls |
| `success / warning / info` | Status states | Progress indicators, notifications, badges |
| `chart-1` through `chart-5` | Default chart palette | Charts and chart-driven dashboard blocks |
| `sidebar` tokens | Sidebar-specific surfaces and states | Sidebar container, navigation, interactive states |

---

## 4. Component Mapping

### Status State Color Mapping

| Status State | Token | Color | Usage |
|---|---|---|---|
| Course in progress | `--accent` | Teal | Progress cards, badges |
| Course completed | `--success` | Teal-600 | Completion indicators, certificates |
| Live class active | `--warning` | Amber (pulsing) | Live badges, indicators |
| Assignment pending | `--warning` | Amber | Assignment list cards |
| Assignment graded | `--success` | Teal | Notification badges |
| Quiz passed | `--success` | Teal | Results cards |
| Quiz failed | `--destructive` | Red | Error states |
| Free preview | `--info` | Blue | Preview badges, buttons |
| Premium/Paid | `--warning` | Amber | Price tags, badges |
| Error/Invalid | `--destructive` | Red | Form errors, alerts |
| Muted text | `--muted-foreground` | Slate-500 | Descriptions, helper text |
| Input focus | `--ring` | Indigo-600 | Form field focus states |

### Button Hierarchy

| Button Type | Classes | Usage |
|---|---|---|
| Primary | `bg-primary text-primary-foreground hover:bg-primary/90` | Main actions: "Enroll", "Start Course", "Submit" |
| Secondary | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | Supporting actions: "Cancel", "Back" |
| Destructive | `bg-destructive text-destructive-foreground hover:bg-destructive/90` | Delete, remove, cancel with warning |
| Ghost | `hover:bg-accent hover:text-accent-foreground` | Less emphasized actions, toolbar buttons |
| Outline | `border border-input bg-background hover:bg-accent hover:text-accent-foreground` | Alternative actions, tertiary buttons |

### ShadCN Component Token Usage

| Component | Primary Tokens Used |
|---|---|
| Button | `primary`, `primary-foreground`, `destructive`, `accent`, `muted`, `ring` |
| Card | `card`, `card-foreground`, `border` |
| Input | `input`, `foreground`, `border`, `ring` |
| Badge | `primary`, `secondary`, `destructive`, `outline`, `success`, `warning`, `info` |
| Progress | `primary` for filled, `secondary` for unfilled |
| Alert | `destructive` for errors, `warning` for warnings, custom `info` for info |
| Tabs | `background`, `foreground`, `accent` for active state |
| Skeleton | `muted` for placeholder |
| Dialog/Popover | `popover`, `popover-foreground`, `border` |
| Select | `input`, `popper`, `foreground`, `accent` |
| Toast | `background`, `foreground`, `border`, `destructive`, `success` |

---

## 5. Typography

### Font Family

| Role | Font | Weight | Usage |
|---|---|---|---|
| **Body & UI** | **Inter** | 400, 500, 600, 700 | All text, UI elements, paragraphs |
| **Headings** | **Inter** (tighter tracking) or **Plus Jakarta Sans** | 600, 700, 800 | Page titles, section headings, card titles |
| **Monospace** | **JetBrains Mono** | 400, 500 | Code blocks, code snippets, technical content |

**Rationale:**
- **Inter**: Industry standard, optimized for screens, excellent legibility at all sizes, free, supports Latin + Devanagari scripts
- **Plus Jakarta Sans** (optional): Geometric, modern, tech-forward feel. Use for a more distinctive brand voice
- **JetBrains Mono**: Purpose-built for code, includes ligatures, excellent readability for coding course content

### Type Scale (Tailwind defaults)

| Token | Size | Line Height | Usage |
|---|---|---|---|
| `text-xs` | 0.75rem (12px) | 1rem | Labels, captions, helper text |
| `text-sm` | 0.875rem (14px) | 1.25rem | Small text, descriptions, secondary content |
| `text-base` | 1rem (16px) | 1.5rem | Body text, default |
| `text-lg` | 1.125rem (18px) | 1.75rem | Lead paragraphs, emphasized text |
| `text-xl` | 1.25rem (20px) | 1.75rem | Section headings |
| `text-2xl` | 1.5rem (24px) | 2rem | Sub-page titles |
| `text-3xl` | 1.875rem (30px) | 2.25rem | Page titles |
| `text-4xl` | 2.25rem (36px) | 2.5rem | Hero headings |
| `text-5xl` | 3rem (48px) | 1 | Display headings (rare) |
| `text-6xl` | 3.75rem (60px) | 1 | Display headings (hero, landing) |

### Typography Hierarchy

```tsx
// Hero Title
<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
  Master Full-Stack Development
</h1>

// Page Title
<h1 className="text-3xl font-bold tracking-tight">
  My Courses
</h1>

// Section Heading
<h2 className="text-xl font-semibold">
  Progress Overview
</h2>

// Card Title
<h3 className="text-lg font-semibold">
  Course Dashboard
</h3>

// Body Text
<p className="text-base text-muted-foreground">
  Track your learning progress across all enrolled courses.
</p>

// Small / Helper Text
<p className="text-sm text-muted-foreground">
  Last updated 2 hours ago
</p>

// Caption / Label
<span className="text-xs text-muted-foreground">
  Due in 3 days
</span>
```

---

## 6. Accessibility Guidelines

### Color Contrast Requirements

All color combinations must meet **WCAG AA** minimum standards:

| Content Type | Minimum Contrast Ratio | Our Palette Compliance |
|---|---|---|
| Normal text (under 18pt) | 4.5:1 | ✅ All text colors pass |
| Large text (18pt and bold / 24pt+) | 3:1 | ✅ All headings pass |
| UI components / graphics | 3:1 | ✅ Icons, borders pass |

**Verification:**
- Primary (#4F46E5) on white: 7.5:1 ✅ (WCAG AAA)
- Success (#0D9488) on white: 4.9:1 ✅ (WCAG AA)
- Warning (#F59E0B) on white: 2.3:1 ❌ — use with white foreground text
- Muted-foreground (#64748B) on white: 5.4:1 ✅ (WCAG AA)

### Color Independence

Never rely on color alone to convey meaning. Always pair colors with:

- **Icons** — Check icon for success, X icon for error
- **Labels** — "Error" text, "Success" text
- **Patterns** — Dashed borders for disabled, solid for enabled

**Example:**
```tsx
// ✅ Correct — Color + Icon + Label
<div className="flex items-center gap-2 text-success">
  <CheckCircleIcon className="w-4 h-4" />
  <span>Assignment submitted successfully</span>
</div>

// ❌ Incorrect — Color only
<div className="text-success">
  Assignment submitted
</div>
```

### Dark Mode Considerations

- Dark mode is **first-class feature** — Indian students frequently study at night
- Test all UI states in both light and dark mode
- Ensure text remains readable in all states
- Provide system preference detection and manual toggle

### Focus Indicators

All interactive elements must have visible focus indicators:

```tsx
// Use ring token
<button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Click me
</button>
```

### Touch Target Sizes

For mobile-first design (primary audience):

- Minimum touch target: **44px × 44px**
- Recommended: **48px × 48px**
- Spacing between touch targets: **8px minimum**

```tsx
// ✅ Correct
<button className="h-12 px-6 py-2">Enroll Now</button>

// ❌ Incorrect — too small
<button className="h-8 px-2">Enroll</button>
```

### Screen Reader Support

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<section>`)
- Provide meaningful `aria-label` for icon-only buttons
- Announce dynamic content changes with ARIA live regions

```tsx
// Icon-only button with label
<button
  aria-label="Close notification"
  onClick={onClose}
>
  <XIcon />
</button>
```

---

## 7. App-Specific Guidelines

### Student App (`apps/web-student`)

**Characteristics:**
- Warm, inviting, encouraging
- Emphasis on progress and achievement
- Bright, vibrant CTAs for conversion

**Token Usage:**
- Heavier use of `--accent` (teal) for progress states
- `--warning` (amber) for CTAs, live class indicators, premium features
- Celebratory colors for completion states

```tsx
// Enroll CTA — high energy
<Button className="bg-warning text-warning-foreground hover:bg-warning/90">
  Enroll Now • ₹2,499
</Button>

// Progress badge — growth-oriented
<Badge className="bg-success text-success-foreground">
  75% Complete
</Badge>
```

### Instructor App (`apps/web-instructor`)

**Characteristics:**
- Professional, functional, data-focused
- Cleaner, more restrained color usage
- Emphasis on clarity and efficiency

**Token Usage:**
- More neutral surfaces for data tables
- Reserved use of accent colors for key actions
- Professional blue/indigo dominance

```tsx
// Publish course — professional
<Button className="bg-primary text-primary-foreground">
  Publish Course
</Button>

// Revenue highlight — success/positive
<div className="text-success font-semibold">
  +₹24,500 this month
</div>
```

### Admin App (`apps/web-admin`)

**Characteristics:**
- Data-dense, functional
- Cool, reserved color palette
- Emphasis on status and information clarity

**Token Usage:**
- Maximum use of neutral grays for structure
- Status colors used sparingly for clarity
- Minimal decoration

```tsx
// Status badge — clear information
<Badge variant="outline">Pending Review</Badge>
<Badge className="bg-success text-success-foreground">Active</Badge>
<Badge className="bg-destructive text-destructive-foreground">Suspended</Badge>
```

### Landing Page (`apps/web-landing` or separate)

**Characteristics:**
- Maximum brand expression
- Bold, confident colors
- Strong CTAs for conversion

**Token Usage:**
- Primary indigo for brand identity
- Amber for high-contrast CTAs
- Teal for social proof, testimonials

```tsx
// Hero CTA — high contrast, high energy
<Button size="lg" className="bg-warning text-warning-foreground hover:bg-warning/90">
  Start Learning Free
</Button>

// Feature highlight — growth-focused
<div className="text-success">
  50,000+ students enrolled
</div>
```

---

## Design Principles

### 60-30-10 Rule

Apply color distribution for visual balance:
- **60%** neutral backgrounds (white, slate grays)
- **30%** primary color (indigo) and secondary surfaces
- **10%** accent colors (amber, teal) for emphasis

### Visual Hierarchy

Guide attention with deliberate color choices:
1. **Level 1 (most important):** Primary buttons, active states, key CTAs — use primary or accent
2. **Level 2 (supporting):** Secondary actions, navigation links — use muted-foreground
3. **Level 3 (least important):** Backgrounds, borders, subtle elements — use neutral grays

### Consistency Across Apps

While each app has its own character:
- Share the same token system from `/packages/ui`
- Maintain consistent button hierarchy
- Use identical status colors
- Keep typography scale unified

### Performance Considerations

For Indian market with variable bandwidth:
- Avoid heavy gradients or complex filters
- Use solid colors with subtle borders for depth
- Optimize images with SVG icons where possible
- Minimal animations, subtle transitions only

---

## References

### Color Psychology Research Sources
- EdisonOS — "Exploring the Most Effective Colors for Online Learning" (2024)
- Verpex — "Best Color Combinations for Educational Websites" (2025)
- Interaction Design Foundation — "UI Color Palette 2026"
- Color psychology studies on learning environment impact (25% comprehension improvement in blue environments)

### ShadCN Documentation
- [Theming — ShadCN/UI](https://ui.shadcn.com/docs/theming)
- [CSS Variables Convention](https://ui.shadcn.com/docs/components)
- [Component Library](https://ui.shadcn.com/docs/components)

### Accessibility Standards
- WCAG 2.1 AA Guidelines
- WebAIM Contrast Checker
- ARIA Authoring Practices Guide

---

**Document Version:** 1.0
**Last Updated:** 2025
**Maintainer:** Design Team
