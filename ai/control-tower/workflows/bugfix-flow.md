# Workflow: Bug Fix Flow

## Purpose
Structured workflow for diagnosing and fixing bugs with minimal risk.

## Steps

### 1. Reproduce
**Input**: Bug report (user message, error log, or screenshot)
**Action**: Confirm the bug exists
- Identify the affected route/component/procedure
- Reproduce the exact error or unexpected behavior
- Check error logs and browser console
- Note the expected vs. actual behavior

**Output**: Confirmed reproduction steps

### 2. Diagnose
**Input**: Reproduction steps
**Action**: Find the root cause
- Trace the data flow: client → tRPC → server → DB
- Check recent git changes to the affected area
- Look for common patterns:
  - Missing null check
  - Incorrect Zod schema
  - Wrong query filter
  - Missing `'use client'` directive
  - Stale cache data
  - Race condition

**Output**: Root cause identified with file:line reference

### 3. Fix
**Input**: Root cause
**Action**: Implement the minimal fix
- Change only what's needed — no drive-by refactors
- If the fix touches auth/security, load security authority
- If the fix touches UI, check accessibility
- Commit: `fix: description of what was wrong`

**Rules**:
- Prefer the smallest change that fixes the bug
- Don't add new features in a bug fix
- Don't refactor surrounding code
- If the fix reveals a deeper issue, log it as a separate TODO

### 4. Test
**Input**: Fix applied
**Action**: Verify the fix and prevent regression
- Write a test that fails without the fix, passes with it
- Run full test suite
- Manual verification of the reproduction steps

### 5. Review
**Input**: Fix + test
**Action**: Quick review
- Run `node ai/scripts/review-authority.js`
- Verify fix doesn't introduce new issues
- Check for side effects

## Severity Levels

| Level | Response | Example |
|-------|----------|---------|
| Critical | Fix immediately, hotfix branch | Auth bypass, data loss |
| High | Fix within session | Quiz scoring wrong, lesson won't load |
| Medium | Fix in next session | UI glitch, missing translation |
| Low | Add to backlog | Cosmetic issue, minor edge case |
