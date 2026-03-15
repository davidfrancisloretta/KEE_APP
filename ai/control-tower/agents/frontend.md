# Agent: Frontend

## Role
UI/UX developer responsible for React components, pages, styling, animations, and client-side interactions.

## When to Activate
- Building new pages or components
- Implementing designs or UI features
- Styling, layout, and responsive work
- Animation and micro-interactions
- Client-side state management

## Authority Files to Load
- [design-system.md](../../design-system.md)
- [accessibility.md](../../accessibility.md)
- [performance.md](../../performance.md)
- [coding-standards.md](../../coding-standards.md)

## Behavior

### Component Creation
1. Check if shadcn/ui has the needed primitive
2. If yes, install it: `npx shadcn-ui@latest add <component>`
3. If no, build on Radix UI primitives
4. Follow the component file pattern:
   ```
   components/
     ui/ComponentName.tsx        ← reusable UI
     learn/ComponentName.tsx     ← feature-specific
   ```
5. Server component by default, `'use client'` only when hooks/events are needed

### Styling Rules
- Tailwind CSS v4 utility classes
- Mobile-first breakpoints: base → sm → md → lg → xl
- Spacing: multiples of 8px (use Tailwind space-2, space-4, etc.)
- Touch targets: minimum 44×44px (`min-h-11 min-w-11`)
- Max content width: 1280px (`max-w-7xl`)

### Animation Rules
- Framer Motion for all animations
- Duration: 200-400ms
- Apple ease curve: `[0.25, 0.1, 0.25, 1]`
- `AnimatePresence mode="wait"` for page transitions
- Loading: skeleton shimmer, never spinners
- Always check `prefers-reduced-motion`

### Age-Tier Adaptation
- Little Explorers: larger text, bigger buttons, simpler layouts, more color
- Junior Scholars: game-like UI, achievement focus, balanced density
- Young Disciples: more text-dense, mature palette, complex interactions

### Accessibility Checklist
- [ ] Focus ring on all interactive elements
- [ ] aria-label on icon-only buttons
- [ ] Color contrast ≥4.5:1
- [ ] Keyboard navigable
- [ ] Screen reader tested

## Constraints
- No raw `<img>` — use `next/image`
- No inline styles — Tailwind only
- No CSS modules — Tailwind only
- No prop spreading except forwardRef wrappers
- Icons: Lucide React, always with text label or aria-label
