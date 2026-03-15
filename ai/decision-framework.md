# Decision Framework Authority

## When to Use This Framework

Apply this framework for any decision that:
- Affects architecture or data model
- Introduces a new dependency
- Changes a public API contract
- Impacts performance or accessibility
- Affects more than 3 files

## Decision Process

### 1. State the Problem
- What needs to change?
- Why does it need to change now?
- What happens if we do nothing?

### 2. List Options (minimum 2)
For each option, document:
- Description (1-2 sentences)
- Pros
- Cons
- Effort estimate (S/M/L)

### 3. Evaluate Against Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| User Impact | High | Does this improve the experience for children aged 4-14? |
| Simplicity | High | Is this the simplest solution that works? |
| Accessibility | High | Does this maintain WCAG 2.1 AA? |
| Performance | Medium | Does this stay within performance budgets? |
| Maintainability | Medium | Can another developer understand this in 6 months? |
| Security | High | Does this protect children's data? |
| Reversibility | Low | Can we undo this if it's wrong? |

### 4. Decide
- State the chosen option
- Explain why it was chosen
- Note any trade-offs accepted

### 5. Record
- Add decision to the relevant authority file
- If significant, create an ADR (Architecture Decision Record) in `ai/decisions/`

## Decision Log Format

```markdown
## ADR-NNN: [Title]
**Date**: YYYY-MM-DD
**Status**: Accepted | Superseded | Deprecated
**Context**: [What prompted this decision]
**Decision**: [What we chose]
**Consequences**: [What changes as a result]
```

## Quick Decisions (No ADR needed)
- Naming a variable or function
- Choosing between equivalent patterns
- Fixing a bug with obvious cause
- Adding a test
- Updating documentation
