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
- Customize via CSS variables, not component props

### Custom Components
| Component | Purpose | Status |
|-----------|---------|--------|
| `EzraOwl` | Animated mascot guide | Built |
| `XPBar` | XP progress with animation | Built |
| `LessonCard` | Lesson grid card | Built |
| `LessonPlayer` | Step-through lesson viewer | Built |
| `QuizEngine` | Interactive quiz with hints | Built |
| `Navigation` | Responsive nav (tabs/sidebar) | Built |
| `BadgeDisplay` | Achievement showcase | Planned |
| `StreakCounter` | Daily streak tracker | Planned |
| `AgeGateSelector` | Age tier picker | Planned |

## Color System

### Semantic Tokens
```css
--primary: /* warm gold/amber — engagement, CTAs */
--secondary: /* sky blue — trust, information */
--success: /* green — completion, XP earned */
--warning: /* orange — streaks, gentle alerts */
--destructive: /* red — errors only, used sparingly */
--muted: /* gray — disabled, secondary text */
```

### Age-Tier Themes
- **Little Explorers**: Brighter, more saturated, larger elements
- **Junior Scholars**: Balanced, game-like feel
- **Young Disciples**: More mature, subtle palette

## Layout

### Spacing Scale (8px base)
- `space-1`: 4px (tight)
- `space-2`: 8px (default gap)
- `space-3`: 12px
- `space-4`: 16px (card padding, section gap)
- `space-6`: 24px (section padding)
- `space-8`: 32px (page sections)
- `space-12`: 48px (major sections)

### Grid
- Lesson cards: responsive grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Dashboard: sidebar (240px) + main content
- Content max-width: 1280px

### Touch Targets
- Minimum: 44×44px (Apple HIG)
- Quiz options: 48px height minimum
- Navigation items: 48×48px minimum
- Spacing between targets: ≥8px

## Typography

- Font stack: system UI fonts (SF Pro, Segoe UI, Roboto, etc.)
- Indic script fonts loaded per locale (Noto Sans family)
- Scale: xs(12) sm(14) base(16) lg(18) xl(20) 2xl(24) 3xl(30)
- Line height: 1.5 for body, 1.2 for headings
- Font weight: 400 (body), 500 (labels), 600 (headings), 700 (emphasis)

## Animation

### Framer Motion Defaults
```tsx
const springConfig = { type: 'spring', stiffness: 300, damping: 30 }
const easeConfig = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
```

### Rules
- Entry animations: fade + slide (y: 20 → 0)
- Exit animations: fade + slide (y: 0 → -10)
- Hover: subtle scale (1.02) on cards
- Loading: skeleton shimmer, never spinners
- Achievements: confetti/sparkle burst
- Respect `prefers-reduced-motion`: disable all transform animations

## Iconography

- Icon library: Lucide React (consistent with shadcn/ui)
- Size: 16px (inline), 20px (buttons), 24px (navigation), 32px (feature)
- Stroke width: 2px
- Always pair icons with text labels for accessibility

## Dark Mode

- Support via `class` strategy (not `media`)
- Toggle in user settings
- All color tokens must have dark variants
- Images/illustrations: provide dark-mode alternatives or use CSS filter
