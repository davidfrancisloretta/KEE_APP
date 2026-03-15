# Skill: Scaffold Component

## Trigger
User asks to create a new UI component.

## Input
- Component name (PascalCase)
- Component type: `ui` (reusable) or feature-specific folder (e.g., `learn`, `dashboard`)
- Whether it needs client-side interactivity

## Process

1. **Check shadcn/ui** — does a primitive already exist?
   - If yes: `npx shadcn-ui@latest add <component>` then customize
   - If no: proceed with custom component

2. **Load authorities**:
   - design-system.md (spacing, colors, animation)
   - accessibility.md (contrast, focus, aria)
   - coding-standards.md (naming, patterns)

3. **Generate component file**:
   ```
   components/<folder>/<ComponentName>.tsx
   ```

4. **Apply design system rules**:
   - Tailwind CSS v4 classes
   - Mobile-first responsive
   - Touch targets ≥44px
   - Framer Motion for animations
   - `prefers-reduced-motion` support

5. **Add accessibility**:
   - Semantic HTML elements
   - aria-labels where needed
   - Keyboard navigation
   - Focus management

6. **Generate test file** (if component has logic):
   ```
   components/<folder>/<ComponentName>.test.tsx
   ```

## Template (Server Component)
```tsx
interface ComponentNameProps {
  // typed props
}

export function ComponentName({ prop }: ComponentNameProps) {
  return (
    <div className="...">
      {/* content */}
    </div>
  )
}
```

## Template (Client Component)
```tsx
'use client'

import { motion } from 'framer-motion'

interface ComponentNameProps {
  // typed props
}

export function ComponentName({ prop }: ComponentNameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="..."
    >
      {/* content */}
    </motion.div>
  )
}
```
