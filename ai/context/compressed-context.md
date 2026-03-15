# ScriptureQuest — Compressed Context
> Generated: 2026-03-14T09:29:28.502Z

## Git State
Branch: master | Ahead: "?" | Behind: "?"

### Recent Commits
4ed8478 chore: initialize KEE project

### Active Changes
[NEW] .env.example
[NEW] .eslintrc.json
[NEW] .gitignore
[NEW] Beginners/
[NEW] "Biblical Covenants/"
[NEW] "Biblical Doctrines/"
[NEW] ScriptureQuest_AdminPortal_Spec.docx
[NEW] ScriptureQuest_AdminPortal_Spec.pdf
[NEW] ScriptureQuest_Blueprint.docx
[NEW] ScriptureQuest_Blueprint.pdf
[NEW] ai/
[NEW] app/
[NEW] components/
[NEW] docker-compose.yml
[NEW] drizzle.config.ts
[NEW] lib/
[NEW] next-env.d.ts
[NEW] next.config.js
[NEW] package-lock.json
[NEW] package.json
[NEW] postcss.config.js
[NEW] scripts/
[NEW] server/
[NEW] tsconfig.json

## Database Schema
Tables: users, lessons, lessonSteps, series, quizzes, questions, quizAttempts, userProgress, badges, userBadges, streaks, contentUploads, lessonReviews
Enums: ageGroupEnum, userRoleEnum, lessonStatusEnum, questionTypeEnum

## App Routes
  /
  /admin
  /admin/review
  /admin/upload
  /lessons
  /lessons/[lessonId]
  /login
  /parent
  /progress
  /quiz/[quizId]
  /register
  /teacher

## Authority File Summaries
### ScriptureQuest — AI Engineering Authority File
# ScriptureQuest — AI Engineering Authority File
> This file is the single source of truth for AI-assisted development on the ScriptureQuest (KEE) platform. Every Claude session MUST read this file first.
## Project Identity
- **Name**: ScriptureQuest (KEE — Kingdom Educational Experience)
- **Purpose**: Interactive scripture learning platform for children aged 4-14
- **Stack**: Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS v4 · tRPC v10 · Drizzle ORM · PostgreSQL 16 · Redis 7 · Auth.js v5 · Zustand · Framer Motion
- **Design System**: shadcn/ui + Radix UI primitives
- **Design Philosophy**: Apple HIG principles — clarity, deference, depth
## Age Tiers
| Tier | Age | Slug | XP/Lesson |

### Architecture Authority
# Architecture Authority
## System Architecture
## Key Decisions
### App Router (not Pages Router)
- All routes in `/app` directory
- Server components by default
- Client components marked with `'use client'`
- Route groups: `(auth)`, `(learn)`, `(dashboard)`, `(admin)`
### tRPC v10 + React Query v4
- Batch HTTP link for request coalescing

### Coding Standards Authority
# Coding Standards Authority
## TypeScript
- Strict mode enabled (`strict: true` in tsconfig)
- No `any` — use `unknown` + type guards when type is uncertain
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use `satisfies` operator for type-safe object literals
- Named exports only (no default exports except Next.js pages)
- Path alias: `@/` for all imports from project root
## File Naming
- Components: `PascalCase.tsx` (e.g., `LessonCard.tsx`)

### Design System Authority
# Design System Authority
## Foundation
- **Library**: shadcn/ui + Radix UI primitives
- **Philosophy**: Apple Human Interface Guidelines
- **Approach**: Mobile-first, progressive enhancement
- **Target users**: Children aged 4-14 (large touch targets, clear visuals, engaging feedback)
## Component Library
### Base Components (shadcn/ui)
- Button, Card, Dialog, DropdownMenu, Input, Label, Select, Tabs, Toast, Tooltip
- Install via: `npx shadcn-ui@latest add <component>`

### Security Authority
# Security Authority
## Children's Data Protection
### COPPA Compliance Principles
- Minimal data collection — only what's needed for the learning experience
- Parental consent required for accounts under 13
- No targeted advertising, no data selling
- Clear privacy policy in simple language
- Parent can review/delete child data at any time
## Authentication & Authorization
### Auth.js v5 Configuration

### Performance Authority
# Performance Authority
## Budgets
| Metric | Target | Tool |
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| FID (First Input Delay) | < 100ms | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| TTI (Time to Interactive) | < 3.5s | Lighthouse |
| JS Bundle (initial) | < 200KB gzipped | webpack-bundle-analyzer |
| Page weight (total) | < 1MB | DevTools |
## Next.js Optimization

### Testing Authority
# Testing Authority
## Strategy
### Test Pyramid
### Coverage Targets
- Overall: ≥80%
- tRPC routers: ≥90%
- Content parser: ≥90% (data integrity is critical)
- UI components: ≥70%
- Utilities: 100%
## Tools

## Dependencies
Dependencies: @auth/core, @auth/drizzle-adapter, @tanstack/react-query, @trpc/client, @trpc/next, @trpc/react-query, @trpc/server, drizzle-orm, framer-motion, next, next-auth, postgres, react, react-dom, superjson, zod, zustand
DevDependencies: @tailwindcss/postcss, @types/node, @types/pdf-parse, @types/react, @types/react-dom, drizzle-kit, eslint, eslint-config-next, mammoth, pdf-parse, postcss, tailwindcss, tsx, typescript

## Open TODOs
No TODOs found.
