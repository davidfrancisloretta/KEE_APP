# Skill: Run Audit

## Trigger
User asks to audit code quality, accessibility, or performance.

## Input
- Audit type: `all`, `accessibility`, `performance`, `security`, `standards`
- Scope: `full` (whole project) or `changed` (git diff only)

## Process

### Standards Audit
1. Run `node ai/scripts/review-authority.js`
2. Report violations grouped by severity

### Accessibility Audit
1. Check all `.tsx` components for:
   - Missing aria-labels on icon buttons
   - Missing alt text on images
   - Color contrast issues (manual check)
   - Keyboard navigation gaps
   - Missing focus management
2. Run axe-core if available

### Performance Audit
1. Check for:
   - Unnecessary `'use client'` directives
   - Missing `next/image` usage
   - Large component bundles (should use dynamic import)
   - Missing React Query cache configuration
   - N+1 query patterns in routers
2. Check bundle size if build artifacts available

### Security Audit
1. Check for:
   - Hardcoded secrets
   - Missing input validation
   - Unprotected routes
   - Raw SQL usage
   - Missing role checks
   - Exposed error details

## Output Format
```markdown
## Audit Report — [Type]
Date: YYYY-MM-DD

### Critical (must fix)
- [ ] Issue description (file:line)

### Warnings (should fix)
- [ ] Issue description (file:line)

### Suggestions (nice to have)
- [ ] Improvement suggestion

### Score
Standards: X/10
Accessibility: X/10
Performance: X/10
Security: X/10
```
