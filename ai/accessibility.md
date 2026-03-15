# Accessibility Authority

## Standard: WCAG 2.1 AA

ScriptureQuest serves children aged 4-14 — accessibility is not optional.

## Color & Contrast

- Text contrast ratio: ≥4.5:1 (normal text), ≥3:1 (large text ≥18px bold or ≥24px)
- UI component contrast: ≥3:1 against adjacent colors
- Never use color alone to convey meaning — pair with icons, text, or patterns
- Quiz feedback: correct (green + checkmark), incorrect (red + X icon + text)

## Keyboard Navigation

- All interactive elements reachable via Tab
- Focus order follows visual layout (logical tab sequence)
- Focus ring: 2px solid, offset 2px, primary color
- Escape closes modals/dialogs
- Enter/Space activates buttons and options
- Arrow keys navigate within radio groups, tabs, menus

## Screen Readers

- All images: meaningful `alt` text or `role="presentation"`
- Icon-only buttons: `aria-label` required
- Live regions: `aria-live="polite"` for score updates, quiz feedback
- `aria-live="assertive"` for error messages only
- Form inputs: associated `<label>` or `aria-label`
- Loading states: `aria-busy="true"` on container
- Page title: unique per route via metadata

## Motion & Animation

- Respect `prefers-reduced-motion: reduce`
- When reduced: disable transforms, keep opacity fades (≤200ms)
- No auto-playing animations that can't be paused
- No flashing content (seizure risk)

## Touch & Motor

- Touch targets: minimum 44×44px
- Spacing between targets: ≥8px
- No drag-only interactions — always provide tap/click alternative
- Time limits: generous or none (children may be slow readers)
- Quiz: no countdown timers for younger age groups

## Text & Readability

- Support browser zoom up to 200%
- No text in images
- Readable font size: minimum 14px, prefer 16px
- Line length: max 70 characters for readability
- Paragraph spacing: ≥1.5× font size

## Forms

- Error messages: specific, constructive, adjacent to field
- Required fields: marked with text "(required)", not just asterisk
- Input validation: on blur, not on every keystroke
- Success confirmation: clear visual + screen reader announcement

## Testing Checklist

- [ ] axe-core: 0 critical/serious violations
- [ ] Keyboard-only navigation: all features reachable
- [ ] Screen reader: VoiceOver + NVDA tested
- [ ] Zoom 200%: no content loss or overlap
- [ ] Color contrast: verified with DevTools
- [ ] Reduced motion: animations gracefully degrade
