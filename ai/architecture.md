# Architecture Authority

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│  Next.js App Router · React 18 · Tailwind v4        │
│  Zustand (state) · Framer Motion (animation)        │
├─────────────────────────────────────────────────────┤
│                    tRPC v10 Layer                     │
│  httpBatchLink · superjson · Zod validation          │
├─────────────────────────────────────────────────────┤
│                    Server Layer                       │
│  Auth.js v5 (JWT) · tRPC Routers · Business Logic   │
├─────────────────────────────────────────────────────┤
│                    Data Layer                         │
│  Drizzle ORM · PostgreSQL 16 · Redis 7              │
└─────────────────────────────────────────────────────┘
```

## Key Decisions

### App Router (not Pages Router)
- All routes in `/app` directory
- Server components by default
- Client components marked with `'use client'`
- Route groups: `(auth)`, `(learn)`, `(dashboard)`, `(admin)`

### tRPC v10 + React Query v4
- Batch HTTP link for request coalescing
- superjson for date/bigint serialization
- Zod schemas for input validation
- `publicProcedure` and `protectedProcedure` contexts

### Authentication: Auth.js v5
- JWT session strategy (stateless, no DB session lookups)
- Drizzle adapter for user storage
- Custom pages: `/login`, `/register`
- Roles: `student`, `parent`, `teacher`, `admin`

### Database: PostgreSQL 16 + Drizzle ORM
- Port: **5433** (mapped in docker-compose)
- Named imports from schema (not `import * as schema`)
- Migrations via `drizzle-kit generate` + `drizzle-kit push:pg`

### State Management: Zustand
- Client-side global state for UI concerns
- Server state via tRPC/React Query (no duplication)
- Persisted stores for offline-capable features

### Content Pipeline
- DOCX parsing: mammoth
- PDF parsing: PyPDF2 via Python subprocess
- Section detection via regex patterns
- Seed script: `npx tsx scripts/seed.ts`

## Route Map

| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Landing/home | Public |
| `/login`, `/register` | Authentication | Public |
| `/lessons` | Lesson browser | Protected |
| `/lessons/[lessonId]` | Lesson player | Protected |
| `/quiz/[quizId]` | Quiz engine | Protected |
| `/progress` | Student progress | Protected |
| `/parent` | Parent dashboard | Parent role |
| `/teacher` | Teacher dashboard | Teacher role |
| `/admin` | Admin panel | Admin role |
| `/admin/upload` | Content upload | Admin role |
| `/admin/review` | Content review | Admin role |

## Database Schema (12+ tables)

Core entities: `users`, `lessons`, `lessonSteps`, `series`, `quizzes`, `questions`, `quizAttempts`, `userProgress`, `badges`, `userBadges`, `streaks`, `contentUploads`, `lessonReviews`

See: [server/db/schema.ts](../server/db/schema.ts)
