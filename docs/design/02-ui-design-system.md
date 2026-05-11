# UI Design System & Component Specifications

**Version:** 1.0  
**Last Updated:** May 2026  
**Status:** Approved for Implementation

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Platform-Specific Guidelines](#platform-specific-guidelines)
7. [Responsive Design Strategy](#responsive-design-strategy)
8. [Accessibility Standards](#accessibility-standards)

---

## Design Philosophy

### Core Principles

1. **Trust & Clarity** - Professional, clean interface that instills confidence in an educational platform
2. **Performance-First** - Optimized for variable network conditions (low-bandwidth Indian networks)
3. **Accessibility** - WCAG 2.1 AA compliance; supports screen readers and keyboard navigation
4. **Mobile-First** - Student and Instructor apps designed mobile-first, then enhanced for desktop
5. **Consistency** - Unified design language across Landing, Student, Instructor, and Admin apps
6. **Simplicity** - Minimal, purposeful UI; no decorative elements or unnecessary complexity

### Target User Context

- **Primary User:** Indian college students (18-26 years old)
- **Devices:** Mobile-first (50-70% mobile, 30-50% desktop)
- **Network:** Variable connectivity (2G–4G)
- **Language:** English primary (future: Hindi support)
- **Payment:** INR via Razorpay

---

## Color System

### Palette

| Role | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Primary Brand** | #2563EB | 37, 99, 235 | Buttons, links, active states, primary CTAs |
| **Primary Dark** | #1E40AF | 30, 64, 175 | Hover states, active tabs, emphasis |
| **Secondary** | #10B981 | 16, 185, 129 | Success states, completion badges, progress |
| **Warning** | #F59E0B | 245, 158, 11 | Alerts, warnings, in-progress states |
| **Danger** | #EF4444 | 239, 68, 68 | Errors, failed states, destructive actions |
| **Light Gray** | #F3F4F6 | 243, 244, 246 | Backgrounds, cards, disabled states |
| **Medium Gray** | #9CA3AF | 156, 163, 175 | Secondary text, borders, icons |
| **Dark Gray** | #374151 | 55, 65, 81 | Primary text, headings |
| **Black** | #1F2937 | 31, 41, 55 | Text on light backgrounds, emphasis |
| **White** | #FFFFFF | 255, 255, 255 | Backgrounds, cards, text on dark |

### Color Usage Rules

- **Primary Blue (#2563EB):** Interactive elements, primary CTAs, focus states
- **Green (#10B981):** Success messages, completion, positive actions
- **Orange (#F59E0B):** Warnings, in-progress states, requires attention
- **Red (#EF4444):** Errors, destructive actions, failed attempts
- **Grays:** Text hierarchy, borders, disabled states, backgrounds

### Dark Mode

*Future consideration:* Design system is light-mode first. Dark mode support planned for Phase 2.

---

## Typography

### Font Families

| Family | Usage | Weight Range | Notes |
|--------|-------|--------------|-------|
| **Inter** | Body text, labels, form inputs | 400, 500, 600 | Primary sans-serif for readability |
| **Poppins** | Headings, CTAs, prominent text | 600, 700 | Bold, modern feel for emphasis |

### Scale & Weights

| Element | Font | Size | Weight | Line Height | Letter Spacing |
|---------|------|------|--------|-------------|-----------------|
| **H1 (Page Title)** | Poppins | 32px | 700 | 1.2 (38px) | -0.5px |
| **H2 (Section Title)** | Poppins | 24px | 700 | 1.3 (31px) | -0.3px |
| **H3 (Subsection)** | Poppins | 20px | 600 | 1.4 (28px) | 0px |
| **Body Large** | Inter | 16px | 400 | 1.5 (24px) | 0px |
| **Body Regular** | Inter | 14px | 400 | 1.5 (21px) | 0px |
| **Body Small** | Inter | 12px | 400 | 1.4 (17px) | 0px |
| **Label/Badge** | Inter | 12px | 500 | 1.4 (17px) | 0.5px |
| **Button** | Poppins | 16px | 600 | 1.5 (24px) | 0px |

### Typography Rules

- **Headings:** Always use Poppins, bold weight, consistent hierarchy
- **Body Text:** Always use Inter, max 75 characters per line for readability
- **Line Height:** Never less than 1.4; use 1.5–1.6 for body text
- **Mobile:** Reduce font sizes on mobile by 1–2 steps (e.g., H1 → 28px on mobile)

---

## Spacing & Layout

### Spacing Scale

All spacing uses a 4px grid system for consistency.

| Scale | px | Usage |
|-------|----|----|
| **xs** | 4px | Micro-spacing (icon padding) |
| **sm** | 8px | Small gaps (inline elements) |
| **md** | 12px | Standard gaps |
| **lg** | 16px | Component padding, section spacing |
| **xl** | 24px | Section gaps, card margins |
| **2xl** | 32px | Large section gaps |
| **3xl** | 48px | Hero spacing, page-level gaps |
| **4xl** | 64px | Largest section spacing |

### Layout Grids

- **Desktop:** 12-column grid with 16px gutters
- **Tablet (768px):** 8-column grid with 12px gutters
- **Mobile:** Full-width with 12px–16px safe margins

### Component Padding/Margins

| Component | Padding | Margin |
|-----------|---------|--------|
| **Button** | 12px 24px | — |
| **Input Field** | 12px 16px | margin-bottom: 12px |
| **Card** | 16px–24px | margin-bottom: 16px |
| **Section** | 24px–32px | margin-bottom: 48px |

---

## Components

### 1. Buttons

#### Primary Button
- **Background:** #2563EB (blue)
- **Text Color:** white
- **Padding:** 12px 24px
- **Border Radius:** 8px
- **Font Weight:** 600
- **Hover State:** Background #1E40AF (darker blue)
- **Active State:** Background #1E3A8A, shadow inset
- **Disabled State:** Background #D1D5DB, text #9CA3AF

#### Secondary Button
- **Background:** #F3F4F6 (light gray)
- **Text Color:** #374151 (dark gray)
- **Padding:** 12px 24px
- **Border Radius:** 8px
- **Border:** 1px solid #E5E7EB
- **Hover State:** Background #E5E7EB
- **Active State:** Background #D1D5DB

#### Icon Button
- **Size:** 40px × 40px
- **Padding:** 8px
- **Border Radius:** 8px
- **Icon Size:** 24px
- **Hover State:** Background #F3F4F6

#### Button Sizes
- **Large:** 16px padding, 18px font (CTAs, important actions)
- **Regular:** 12px padding, 16px font (standard buttons)
- **Small:** 8px padding, 14px font (secondary actions)

### 2. Input Fields & Forms

#### Text Input
- **Height:** 40px
- **Padding:** 12px 16px
- **Border:** 1px solid #E5E7EB
- **Border Radius:** 8px
- **Focus State:** Border #2563EB, box-shadow: 0 0 0 3px #DBEAFE
- **Error State:** Border #EF4444, text #EF4444
- **Disabled State:** Background #F3F4F6, text #9CA3AF

#### Label
- **Font Size:** 14px
- **Font Weight:** 500
- **Color:** #374151
- **Margin Bottom:** 8px
- **Required Indicator:** Red asterisk *

#### Placeholder
- **Color:** #9CA3AF
- **Font Style:** Normal

### 3. Cards

#### Standard Card
- **Background:** white
- **Border:** 1px solid #E5E7EB
- **Border Radius:** 12px
- **Padding:** 16px–24px
- **Box Shadow:** 0 1px 3px rgba(0, 0, 0, 0.1)
- **Hover State (interactive):** shadow 0 4px 6px rgba(0, 0, 0, 0.1), translate up 2px

#### Course Card (specific variant)
- **Dimensions:** 160px–180px width (mobile), 200px (desktop)
- **Contains:** Thumbnail (1:1 ratio), title (2 lines), instructor, price, rating
- **Hover State:** Subtle shadow increase

### 4. Navigation

#### Bottom Tab Bar (Mobile)
- **Height:** 64px
- **Background:** white
- **Border Top:** 1px solid #E5E7EB
- **Active Tab Icon Color:** #2563EB
- **Inactive Tab Icon Color:** #9CA3AF
- **Badge (notification count):** Background red, white text, 20px height

#### Sidebar (Desktop)
- **Width:** 240px
- **Background:** white
- **Border Right:** 1px solid #E5E7EB
- **Active Item:** Background #2563EB with white text
- **Item Padding:** 12px 16px
- **Item Font Size:** 14px

### 5. Badges & Status Indicators

| Badge Type | Background | Text | Usage |
|------------|-----------|------|-------|
| **Success** | #D1FAE5 | #065F46 | Completed, passed, paid |
| **Warning** | #FEF3C7 | #92400E | In progress, pending, warning |
| **Error** | #FEE2E2 | #991B1B | Failed, error, overdue |
| **Info** | #DBEAFE | #1E40AF | Information, new, draft |
| **Neutral** | #E5E7EB | #374151 | Neutral status |

### 6. Toast Notifications

#### Success Toast
- **Background:** #D1FAE5 (light green)
- **Border Left:** 4px solid #10B981
- **Text Color:** #065F46
- **Icon:** Green checkmark

#### Error Toast
- **Background:** #FEE2E2 (light red)
- **Border Left:** 4px solid #EF4444
- **Text Color:** #991B1B
- **Icon:** Red X or alert icon

#### Info Toast
- **Background:** #DBEAFE (light blue)
- **Border Left:** 4px solid #2563EB
- **Text Color:** #1E40AF
- **Icon:** Info icon

#### Warning Toast
- **Background:** #FEF3C7 (light orange)
- **Border Left:** 4px solid #F59E0B
- **Text Color:** #92400E
- **Icon:** Warning triangle

**Positioning:** Bottom-right corner, 16px margin from edges  
**Duration:** 5 seconds (auto-dismiss) or dismiss button

### 7. Modals & Dialogs

#### Backdrop
- **Background:** Transparent dark overlay
- **Opacity:** 50% (#000000 at 50%)

#### Modal Container
- **Max Width:** 500px on desktop, 90vw on mobile
- **Border Radius:** 12px
- **Padding:** 24px
- **Box Shadow:** 0 20px 25px rgba(0, 0, 0, 0.15)
- **Background:** white

#### Modal Header
- **Font:** Poppins 24px 700
- **Margin Bottom:** 16px
- **Close Button:** Top-right, 32px × 32px

#### Modal Body
- **Font:** Inter 14px 400
- **Margin Bottom:** 24px

#### Modal Footer
- **Display:** flex, justify-content: flex-end
- **Button Spacing:** 12px gap

### 8. Loading States

#### Skeleton Loaders
- **Background:** #F3F4F6
- **Shimmer Animation:** Light gradient moving left to right, 2 seconds duration
- **Border Radius:** Match component being loaded (8px for buttons, 12px for cards)

#### Spinner
- **Size:** 24px (regular), 32px (large)
- **Color:** #2563EB
- **Animation:** Rotating indefinitely, 1s per rotation

### 9. Progress Indicators

#### Progress Bar
- **Height:** 4px (standalone), 6px (with labels)
- **Background:** #E5E7EB
- **Fill Color:** #10B981 (completed), #2563EB (active)
- **Border Radius:** 2px

#### Progress Ring (Circular)
- **Size:** 48px–80px
- **Stroke Width:** 4px
- **Color:** #10B981
- **Background:** #E5E7EB

---

## Platform-Specific Guidelines

### Landing Page

#### Hero Section
- **Background:** White with subtle light gray accent
- **Heading:** Poppins 40px–48px (desktop), 28px–32px (mobile)
- **CTA Button:** Primary button, 16px padding
- **Layout:** Centered text over optional background image or illustration

#### Feature Cards
- **Count:** 3–4 cards
- **Layout:** Grid (3 columns desktop, 1 column mobile)
- **Card Style:** White background, subtle border, icon above text
- **Icon Size:** 48px
- **Icon Color:** #2563EB

#### Social Proof Section
- **Testimonials:** Max 3 visible with carousel
- **Avatar:** 40px circles
- **Rating:** 5-star display, gold color (#FBBF24)

#### CTA Banner
- **Styling:** Colored background (#2563EB) with white text
- **Button:** White text button
- **Padding:** 48px

### Student App

#### Dashboard
- **Welcome Header:** Poppins 24px with user first name
- **Section Titles:** Poppins 20px
- **Course Cards:** Grid layout, thumbnail 1:1 ratio, 200px width
- **Progress Bars:** 4px height, green color
- **Padding:** 16px (mobile), 24px (desktop)

#### Course Catalog
- **Search Bar:** Full-width, sticky on top, 40px height
- **Filter Chips:** Removable, compact style
- **Course Grid:** 1 column (mobile), 2–3 columns (tablet), 3–4 columns (desktop)
- **Results Count:** Gray text, 12px

#### Video Player
- **Container:** Full-width on mobile, max-width 1280px centered on desktop
- **Controls:** Semi-transparent dark overlay at bottom
- **Seek Bar:** Full-width, 3px height (6px on hover)
- **Lecture List Sidebar:** 240px width (desktop), collapsed on mobile

### Instructor App

#### Dashboard
- **Layout:** 2–3 column grid (desktop), single column (mobile)
- **Stat Cards:** Show key metrics (students, courses, revenue)
- **Course List:** Table on desktop, card list on mobile
- **Action Buttons:** Prominent at top (Create Course, View Analytics)

#### Course Editor
- **Two-Column Layout:** Content list (left), editor panel (right)
- **Left Panel:** 280px width, scrollable
- **Form Fields:** Standard inputs, full-width on mobile
- **Save Button:** Sticky at bottom, primary color

### Admin Dashboard

#### Layout
- **Sidebar:** 240px width (always visible on desktop), collapsible on tablet
- **Top Bar:** 56px height, logo, search, user menu
- **Main Content:** Full-width responsive grid
- **Data Tables:** Horizontal scroll on mobile with sticky first column

#### Analytics
- **Cards:** 4-column grid (desktop), 2-column (tablet), 1-column (mobile)
- **Charts:** Use consistent color palette for consistency
- **Legend:** Positioned below chart

---

## Responsive Design Strategy

### Breakpoints

| Breakpoint | Width | Device |
|------------|-------|--------|
| **Mobile** | 320px–480px | Phones in portrait |
| **Small** | 480px–768px | Phones landscape, small tablets |
| **Tablet** | 768px–1024px | Tablets |
| **Desktop** | 1024px–1440px | Laptops |
| **Large** | 1440px+ | Desktops, large monitors |

### Mobile-First Strategy

1. **Start with mobile:** Design and code for mobile first (320px)
2. **Progressive enhancement:** Add complexity at larger breakpoints
3. **Touch-friendly:** Min 44px touch targets on mobile
4. **Stacking:** Vertical stack on mobile, grid on desktop

### Key Responsive Adjustments

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Font Sizes** | Reduced by 1–2 steps | Reduced by 1 step | Full size |
| **Padding** | 12px–16px | 16px | 24px–32px |
| **Grid Columns** | 1 | 2 | 3–4 |
| **Card Width** | Full (−16px margin) | 280px | 300px–350px |
| **Sidebar** | Collapsed drawer | Side panel | Always visible |

### Touch Targets

- **Minimum size:** 44px × 44px (WCAG guideline)
- **Preferred size:** 48px × 48px
- **Spacing between targets:** 8px minimum

---

## Accessibility Standards

### WCAG 2.1 Level AA Compliance

#### Color Contrast

- **Normal text (14px):** Min 4.5:1 contrast ratio
- **Large text (18px+):** Min 3:1 contrast ratio
- **Graphics & UI components:** Min 3:1 contrast ratio

#### Keyboard Navigation

- **All interactive elements:** Keyboard accessible (Tab, Enter, Arrow keys)
- **Focus indicator:** Visible 3px outline, color #2563EB
- **Tab order:** Logical, top-to-bottom, left-to-right

#### Screen Reader Support

- **Semantic HTML:** Use `<button>`, `<input>`, `<nav>`, `<main>`, `<article>`
- **ARIA labels:** For icon-only buttons, form fields, dynamic content
- **Alt text:** All images must have descriptive alt text
- **Skip links:** "Skip to main content" link at top of page

#### Form Accessibility

- **All labels:** Associated with form fields via `<label>` or aria-label
- **Error messages:** Connected to fields via aria-describedby
- **Required fields:** Marked with * and aria-required="true"

#### Focus Management

- **Modals:** Focus trapped within modal, focus restored on close
- **Dropdowns:** Arrow keys navigate options, Enter selects
- **Buttons:** Clear visual focus state (3px outline or background change)

### Accessibility Checklist

- [ ] All images have alt text
- [ ] Color is not the only indicator of status (use icons/text)
- [ ] Contrast ratio ≥4.5:1 for normal text
- [ ] All buttons/links have visible focus state
- [ ] Form labels are properly associated
- [ ] Page has proper heading hierarchy (H1, then H2, etc.)
- [ ] No content conveyed by color alone
- [ ] Animations can be disabled (prefers-reduced-motion)
- [ ] Video has captions (future when video content added)
- [ ] Screen reader tested (NVDA, JAWS, VoiceOver)

---

## Implementation Checklist

### Phase 1 (MVP)

- [ ] Landing page with hero, features, CTA
- [ ] Authentication pages (login, signup, forgot password, OAuth)
- [ ] Student dashboard with enrolled courses
- [ ] Course catalog with search/filter
- [ ] Video player with basic controls
- [ ] Course detail page
- [ ] Design system Figma file created and shared

### Phase 2 (Student Core)

- [ ] My Courses page
- [ ] Assignments submission UI
- [ ] Quiz interface
- [ ] Community/forums
- [ ] Live class integration
- [ ] Certificates page

### Phase 3 (Instructor + Admin)

- [ ] Instructor dashboard
- [ ] Course creation wizard
- [ ] Instructor analytics
- [ ] Admin dashboard
- [ ] User management
- [ ] Content moderation

### Phase 4 (Polish & Scale)

- [ ] Dark mode support
- [ ] Internationalization (Hindi language support)
- [ ] Performance optimization
- [ ] Advanced analytics visualizations
- [ ] Mobile app version (if needed)

---

## Design Resources

### Tools

- **Design File:** [Figma Link] (to be shared)
- **Component Library:** shadcn/ui (React components)
- **Icons:** Lucide React (24px default)
- **Color Tool:** Tailwind Color Palette

### Brand Assets

- **Logo:** [Link to logo file]
- **Favicon:** [Link to favicon]
- **Fonts:** Inter (Google Fonts), Poppins (Google Fonts)

### References

- **WCAG 2.1 AA:** https://www.w3.org/WAI/WCAG21/quickref/
- **Material Design:** https://material.io/design
- **Tailwind CSS:** https://tailwindcss.com

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Design Lead** | [Name] | [Date] | ☐ |
| **Product Manager** | [Name] | [Date] | ☐ |
| **Tech Lead** | [Name] | [Date] | ☐ |
| **Accessibility** | [Name] | [Date] | ☐ |

---

**Document Version:** 1.0  
**Last Updated:** May 2026  
**Next Review:** August 2026
