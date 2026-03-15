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
- Utilities/hooks: `camelCase.ts` (e.g., `useProgress.ts`)
- Routes: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Server files: `*.server.ts` or in `server/` directory
- Tests: `*.test.ts` / `*.test.tsx` colocated with source

## Component Patterns

```tsx
// Server component (default)
export function LessonList() {
  // Can use async/await, direct DB access
}

// Client component (opt-in)
'use client'
export function LessonPlayer({ lessonId }: { lessonId: string }) {
  // Can use hooks, event handlers, browser APIs
}
```

- Props: destructured in function signature
- No prop spreading (`{...props}`) except for forwardRef wrappers
- Children: explicit `children: React.ReactNode` prop
- Events: `onAction` naming (e.g., `onComplete`, `onSelect`)

## tRPC Patterns

- Input validation: always Zod schema
- Router files: `*.router.ts` in `server/routers/`
- Procedure naming: `verb` + `noun` (e.g., `getLesson`, `submitAnswer`)
- Error handling: throw `TRPCError` with appropriate code

## Database Patterns

- Use Drizzle query builder, not raw SQL
- Named imports: `import { lessons, users } from '../db/schema'`
- Transactions for multi-table writes
- Always include `createdAt`/`updatedAt` on tables

## Import Order

1. React/Next.js
2. Third-party libraries
3. `@/server/*` (server-side)
4. `@/components/*`
5. `@/lib/*`
6. Relative imports
7. Types (if separate)

## Error Handling

- tRPC: `TRPCError` with `code` and `message`
- Components: Error boundaries per route group
- Forms: Zod validation with user-friendly messages
- External APIs: try/catch with fallback UI

## Comments

- No obvious comments (the code should be self-documenting)
- Comment WHY, not WHAT
- TODO format: `// TODO(agent): description`
- FIXME format: `// FIXME(agent): description`
