# EduTech Platform

A live-first EdTech platform for college and university students across India and English-speaking global markets. Built with modern technologies including Next.js, NestJS, Turborepo, and integrated with Mux, LiveKit, and Razorpay.

## 🏗️ Architecture

This is a **monorepo** built with **Turborepo**, consisting of:

### Applications
- `apps/web-student` - Student learning experience (Next.js)
- `apps/web-instructor` - Instructor dashboard and tools (Next.js)
- `apps/web-admin` - Platform administration (Next.js)
- `apps/api` - Backend API (NestJS modular monolith)

### Shared Packages
- `packages/ui` - Shared ShadCN/TailwindCSS component library
- `packages/types` - Shared TypeScript types and interfaces
- `packages/validation` - Shared Zod schemas
- `packages/api-client` - Centralized HTTP client with service modules and React Query integration
- `packages/config` - Shared ESLint, Prettier, TSConfig
- `packages/shared-components` - Cross-app UI components

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.17.0
- npm >= 9.0.0
- PostgreSQL database
- Redis server

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

### Development

```bash
# Start all applications in parallel
npm run dev

# Or start individual apps
cd apps/api && npm run dev
cd apps/web-student && npm run dev
cd apps/web-instructor && npm run dev
cd apps/web-admin && npm run dev
```

### Build

```bash
# Build all packages and applications
npm run build

# Build specific app/package
npx turbo run build --filter=web-student
```

### Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests for specific package
npx turbo run test --filter=api
```

### Linting & Formatting

```bash
# Lint all code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format
```

## 📁 Project Structure

```
edutech/
├── apps/
│   ├── api/                 # NestJS backend
│   ├── web-student/         # Student portal (Next.js)
│   ├── web-instructor/      # Instructor portal (Next.js)
│   └── web-admin/           # Admin portal (Next.js)
├── packages/
│   ├── ui/                  # ShadCN UI components
│   ├── types/               # TypeScript types
│   ├── validation/          # Zod schemas
│   ├── api-client/          # Generated API client
│   ├── config/              # Shared configs (ESLint, Prettier)
│   └── shared-components/    # Cross-app components
├── infra/
│   ├── docker/              # Dockerfiles
│   ├── dokploy/             # Deployment configs
│   └── scripts/             # DB migration scripts
├── docs/                   # Documentation
├── .github/workflows/       # CI/CD pipelines
└── turbo.json             # Turborepo configuration
```

## 🔧 Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS + ShadCN/UI
- **State Management:** Jotai + TanStack Query
- **Video:** Mux Player + LiveKit SDK

### Backend
- **Framework:** NestJS 10
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL
- **Cache:** Redis (BullMQ for jobs)
- **API Docs:** Swagger/OpenAPI

### Infrastructure
- **Monorepo:** Turborepo
- **CI/CD:** GitHub Actions
- **Deployment:** Dokploy
- **Video Processing:** Mux
- **Live Streaming:** LiveKit
- **Payments:** Razorpay
- **File Storage:** AWS S3 + CloudFront CDN
- **Email:** AWS SES
- **Monitoring:** Sentry
- **Analytics:** PostHog

## 📝 Key Features

- **Live Classes** - Real-time video streaming with automatic recording
- **Course Management** - Instructors can create, manage, and monetize courses
- **Video Upload Pipeline** - S3 signed URLs with Mux transcoding
- **Progress Tracking** - Real-time learning progress and resume playback
- **Assignments & Quizzes** - Auto-grading MCQs and manual grading
- **Certificates** - Auto-generated PDF certificates on course completion
- **Chat System** - Real-time course chat with message threading
- **Payment Integration** - Razorpay with webhook handling
- **Role-Based Access** - Student, Instructor, and Admin roles with RBAC
- **OAuth Support** - Google and GitHub OAuth integration

## 🧪 Testing

We maintain high test coverage with:
- **80%** minimum coverage across all packages
- **95%** minimum coverage on critical paths (auth, payments, enrollments, certificates)

### Test Types
- **Unit Tests** - Jest for backend, Vitest for frontend
- **Integration Tests** - API and database integration
- **E2E Tests** - Playwright for critical user journeys

## 🚢 Deployment

### Staging
- Deployed automatically to `develop` branch
- URLs:
  - API: `api.eduplatform.com`
  - Student: `student.eduplatform.com`
  - Instructor: `instructor.eduplatform.com`
  - Admin: `admin.eduplatform.com`

### Production
- Manual deployment from `main` branch
- Requires approval before deploying

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:
- [Product Overview](docs/01-product/01-overview.md)
- [Tech Stack](docs/02-architecture/01-tech-stack.md)
- [Database Schema](docs/02-architecture/04-database.md)
- [30-Day Implementation Plan](docs/05-implementation/01-30-day-plan.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

Proprietary - All rights reserved

## 📧 Contact

For questions or support, contact the development team.

---

Built with ❤️ for learners everywhere.
