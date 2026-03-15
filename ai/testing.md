# Testing Authority

## Strategy

### Test Pyramid
1. **Unit tests** (60%): Pure functions, utilities, data transforms
2. **Integration tests** (30%): tRPC routers with real DB, component rendering
3. **E2E tests** (10%): Critical user flows (login → lesson → quiz → XP)

### Coverage Targets
- Overall: ≥80%
- tRPC routers: ≥90%
- Content parser: ≥90% (data integrity is critical)
- UI components: ≥70%
- Utilities: 100%

## Tools

| Tool | Purpose |
|------|---------|
| Vitest | Unit + integration tests |
| React Testing Library | Component tests |
| Playwright | E2E tests |
| MSW | API mocking (client tests only) |

## Conventions

### File Structure
```
components/
  LessonCard.tsx
  LessonCard.test.tsx    ← colocated
server/routers/
  lesson.router.ts
  lesson.router.test.ts  ← colocated
```

### Naming
- Describe blocks: component/function name
- Test names: `it('should [expected behavior] when [condition]')`

### Patterns
```tsx
// Component test
it('should show completion badge when lesson is complete', () => {
  render(<LessonCard lesson={completedLesson} />)
  expect(screen.getByRole('img', { name: /completed/i })).toBeInTheDocument()
})

// tRPC router test
it('should return lessons filtered by age group', async () => {
  const result = await caller.lesson.list({ ageGroup: 'junior-scholars' })
  expect(result.every(l => l.ageGroup === 'junior-scholars')).toBe(true)
})
```

## Critical Test Scenarios

### Authentication
- [ ] Login with valid credentials
- [ ] Login rejected with wrong password
- [ ] Protected routes redirect to login
- [ ] Role-based access (student can't access admin)

### Lesson Flow
- [ ] Lesson list loads by age group
- [ ] Lesson player steps through all steps
- [ ] Lesson marked complete on last step
- [ ] XP awarded on completion

### Quiz Flow
- [ ] Quiz loads questions for lesson
- [ ] Answer validation (correct/incorrect feedback)
- [ ] Progressive hints (3 levels)
- [ ] Score calculation and pass/fail
- [ ] No double-submit

### Content Parser
- [ ] DOCX extraction produces valid text
- [ ] PDF extraction produces valid text
- [ ] Section detection for all section types
- [ ] Quiz question extraction from "Ask:" patterns
- [ ] Graceful handling of malformed files
