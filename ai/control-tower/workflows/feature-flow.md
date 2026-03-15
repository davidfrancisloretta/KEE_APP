# Workflow: Feature Flow

## Purpose
End-to-end workflow for implementing a new feature from request to merge.

## Steps

### 1. Classify
**Input**: Feature request (user message or issue)
**Action**: Determine type and scope
- Is this a feature, enhancement, bug fix, or config change?
- Which parts of the stack are affected? (DB, API, UI, all)
- Estimate size: S (1-2 files), M (3-5 files), L (6+ files)

**Output**: Classification with affected layers

### 2. Route
**Input**: Classification
**Action**: Select agents and load authorities
- S changes: single agent
- M changes: primary + secondary agent
- L changes: architect first, then frontend/backend

**Agent Selection**:
| Scope | Primary | Secondary |
|-------|---------|-----------|
| DB + API | architect | backend |
| UI only | frontend | — |
| API only | backend | — |
| Full stack | architect | frontend + backend |
| Tests only | qa | — |

### 3. Plan
**Input**: Classification + agent context
**Action**: Architect agent produces implementation plan
- List files to create/modify
- Schema changes (if any)
- API changes (if any)
- UI components needed
- Tests to write
- Validate plan against authority files

**Gate**: User approves plan before proceeding

### 4. Implement
**Input**: Approved plan
**Action**: Execute changes per plan
- Follow coding standards
- One concern per commit
- Commit message format: `type: description`
- Check authority compliance as you go

**Rules**:
- Server components by default
- Zod validation on all inputs
- Named imports from schema
- Touch targets ≥44px
- Responsive mobile-first

### 5. Test
**Input**: Completed implementation
**Action**: QA agent writes and runs tests
- Unit tests for new functions
- Integration tests for new routers
- Component tests for new UI
- Run full test suite — nothing breaks
- Verify coverage targets met

### 6. Review
**Input**: Implementation + tests
**Action**: Reviewer agent checks quality
- Run `node ai/scripts/review-authority.js`
- Manual review against all authority domains
- Check accessibility (if UI changes)
- Check performance impact
- Produce review output

**Gate**: No BLOCKER issues

### 7. Merge
**Input**: Approved review
**Action**: Merge to main
- Squash merge
- Verify build passes
- Delete feature branch

## Branching
```
main ──────────────────────────────────
  └── feat/feature-name ──── squash merge back
```

Branch naming: `feat/`, `fix/`, `refactor/`, `chore/`, `content/`
