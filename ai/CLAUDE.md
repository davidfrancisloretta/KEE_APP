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
|------|-----|------|-----------|
| Little Explorers | 4-6 | `little-explorers` | 10 |
| Junior Scholars | 7-10 | `junior-scholars` | 15 |
| Young Disciples | 11-14 | `young-disciples` | 20 |

## Architecture Rules

1. **App Router only** — no `pages/` directory, no `getServerSideProps`
2. **tRPC v10** requires `@tanstack/react-query@^4.36.0` (NOT v5)
3. **Database port**: PostgreSQL on `localhost:5433` (not 5432)
4. **Path alias**: `@/*` maps to project root
5. **Server components by default** — add `'use client'` only when needed
6. **Drizzle ORM** — use named imports from schema, not `import * as schema`
7. **Tailwind v4** — use `@tailwindcss/postcss`, import via `@import "tailwindcss"`

## Design System Authority

### Component Hierarchy
- Use **shadcn/ui** as the primary component library
- Build on **Radix UI** primitives for accessibility
- Custom components extend shadcn patterns

### Spacing & Touch Targets (Apple HIG)
- Minimum touch target: **44×44px**
- Base spacing unit: **8px** (use multiples: 8, 16, 24, 32, 48)
- Card padding: **16px** minimum
- Content max-width: **1280px** for desktop, full-width mobile

### Typography Scale
- Headings: `text-2xl` (h1), `text-xl` (h2), `text-lg` (h3)
- Body: `text-base` (16px)
- Small: `text-sm` (14px)
- Caption: `text-xs` (12px)
- Font: System font stack (Apple SF Pro fallback chain)

### Color Tokens
- Primary: `--primary` (warm gold/amber for engagement)
- Secondary: `--secondary` (sky blue for trust)
- Success: `--success` (green for completion/XP)
- Warning: `--warning` (orange for streaks/alerts)
- Destructive: `--destructive` (red, used sparingly)
- Background surfaces: max 3 depth levels

### Animation Rules (Framer Motion)
- Duration: 200-400ms for micro-interactions
- Easing: `[0.25, 0.1, 0.25, 1]` (Apple ease curve)
- Page transitions: `AnimatePresence` with `mode="wait"`
- Loading states: skeleton shimmer, never spinners
- Celebrate: confetti/sparkle on achievements only

### Responsive Breakpoints
- Mobile-first CSS
- `sm`: 640px, `md`: 768px, `lg`: 1024px, `xl`: 1280px
- Navigation: bottom tab bar (mobile), sidebar (desktop)

### Accessibility (WCAG 2.1 AA)
- Color contrast ratio: ≥4.5:1 (text), ≥3:1 (large text/UI)
- All interactive elements: focus-visible ring
- Screen reader: aria-labels on icons, live regions for score updates
- Reduced motion: respect `prefers-reduced-motion`
- Font scaling: support up to 200% zoom

## File References

- Architecture details: [ai/architecture.md](ai/architecture.md)
- Coding standards: [ai/coding-standards.md](ai/coding-standards.md)
- Design system deep-dive: [ai/design-system.md](ai/design-system.md)
- Accessibility: [ai/accessibility.md](ai/accessibility.md)
- Security: [ai/security.md](ai/security.md)
- Performance: [ai/performance.md](ai/performance.md)
- Caching: [ai/caching.md](ai/caching.md)
- Observability: [ai/observability.md](ai/observability.md)
- Testing: [ai/testing.md](ai/testing.md)
- AI Pipeline: [ai/ai-pipeline.md](ai/ai-pipeline.md)
- Decision Framework: [ai/decision-framework.md](ai/decision-framework.md)
- Feature Workflow: [ai/feature-workflow.md](ai/feature-workflow.md)
- Data Engineering: [ai/data-engineering.md](ai/data-engineering.md)
- AI-OS Control Tower: [ai/AI-OS.md](ai/AI-OS.md)

## i18n — Supported Languages

| Code | Language | Script |
|------|----------|--------|
| `en` | English | Latin |
| `hi` | Hindi | Devanagari |
| `ta` | Tamil | Tamil |
| `te` | Telugu | Telugu |
| `kn` | Kannada | Kannada |

Default locale: `en`. Fallback chain: user locale → `en`.
