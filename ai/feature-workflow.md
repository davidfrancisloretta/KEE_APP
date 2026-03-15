# Feature Workflow Authority

## Lifecycle

```
1. Request → 2. Classify → 3. Plan → 4. Implement → 5. Test → 6. Review → 7. Merge
```

### 1. Request
- Source: user message, issue tracker, or roadmap
- Must include: what, why, and acceptance criteria

### 2. Classify

| Type | Description | Branch Prefix |
|------|-------------|---------------|
| Feature | New capability | `feat/` |
| Bug Fix | Fix broken behavior | `fix/` |
| Refactor | Code improvement, no behavior change | `refactor/` |
| Chore | Config, deps, tooling | `chore/` |
| Content | Lesson data, translations | `content/` |

### 3. Plan
- Agent produces implementation plan
- Plan validated against authority files
- Break into tasks (max 5 per PR)
- Identify affected files and tests

### 4. Implement
- Follow coding standards (see [coding-standards.md](coding-standards.md))
- One concern per commit
- Commit messages: `type: short description`
  - `feat: add badge display component`
  - `fix: correct quiz score calculation`
  - `refactor: extract lesson step renderer`

### 5. Test
- Write tests alongside code (not after)
- Run existing tests — nothing breaks
- Coverage must not decrease

### 6. Review
- Authority file compliance check
- Accessibility audit (if UI changes)
- Performance impact assessment (if data/rendering changes)
- Security review (if auth/data changes)

### 7. Merge
- Squash merge to main
- Delete feature branch
- Verify deployment

## PR Template

```markdown
## What
[1-2 sentence description]

## Why
[Business/user motivation]

## How
[Technical approach summary]

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Accessibility verified

## Screenshots
[If UI changes]
```

## Rules

- No PR larger than 400 lines of meaningful changes
- No mixing refactors with features in same PR
- Tests must pass before review
- At least 1 approval before merge
