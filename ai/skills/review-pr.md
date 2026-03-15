# Skill: Review PR

## Trigger
User asks to review code changes, a PR, or check quality before merging.

## Input
- PR number or branch name (optional — defaults to current branch diff)

## Process

1. **Gather changes**:
   - `git diff main...HEAD` — all changes on current branch
   - Or `gh pr diff <number>` — specific PR

2. **Run automated review**:
   ```bash
   node ai/scripts/review-authority.js --since main
   ```

3. **Manual review** — read all changed files and check:

   **Coding Standards**:
   - TypeScript strict mode compliance
   - Named exports, proper imports
   - Zod validation on tRPC inputs
   - Error handling patterns

   **Security**:
   - No secrets in code
   - Auth checks on protected routes
   - Input sanitization
   - Safe file handling

   **Accessibility** (if UI changes):
   - Semantic HTML
   - aria-labels
   - Keyboard navigation
   - Color contrast
   - Touch targets

   **Performance** (if rendering/data changes):
   - Server vs client components
   - Image optimization
   - Query efficiency
   - Cache configuration

4. **Check tests**:
   - Are new/modified functions tested?
   - Do existing tests still pass?
   - Is coverage maintained?

5. **Produce review output**:
   ```markdown
   ## Review: [Branch/PR Title]

   ### Summary
   [What changed and why]

   ### Issues
   - [BLOCKER] ... (file:line)
   - [WARNING] ... (file:line)
   - [SUGGESTION] ... (file:line)

   ### Checklist
   - [ ] Standards ✓/✗
   - [ ] Security ✓/✗
   - [ ] Accessibility ✓/✗
   - [ ] Performance ✓/✗
   - [ ] Tests ✓/✗

   ### Verdict
   APPROVE / REQUEST_CHANGES
   ```

## Rules
- Never approve with BLOCKER issues
- Missing tests = WARNING
- Console.log in production = WARNING
- Hardcoded secrets = BLOCKER
