# AI-OS — ScriptureQuest Control Tower

> The AI Operating System orchestrates all AI-assisted development for ScriptureQuest. It coordinates agents, manages context, enforces standards, and drives the feature workflow.

## Control Tower Overview

The Control Tower is the central coordination layer that:
1. **Routes tasks** to the appropriate AI agent
2. **Compresses context** to stay within token limits
3. **Enforces authority files** — no agent bypasses standards
4. **Tracks decisions** for audit and rollback
5. **Manages workflows** from feature request to deployment

## Agent Registry

| Agent | Role | Trigger |
|-------|------|---------|
| `architect` | System design, schema changes, API design | New feature, refactor, migration |
| `frontend` | UI components, pages, styling, animations | UI task, design implementation |
| `backend` | tRPC routers, DB queries, auth, business logic | API, data, auth task |
| `qa` | Test writing, test review, coverage analysis | After code change, before merge |
| `reviewer` | Code review, standards enforcement, PR review | PR created, code submitted |

## Context Compression

Before each session:
1. `context-scan.js` — inventories project files, detects changes since last scan
2. `context-compress.js` — builds a compressed context payload:
   - Authority file summaries
   - Recent git history (last 20 commits)
   - Active file map (files changed in current branch)
   - Schema snapshot
   - Open TODO/FIXME items

Compressed context is stored in `/ai/context/` and loaded at session start.

## Decision Framework

Every non-trivial decision follows:
1. **State the problem** — what needs to change and why
2. **List options** — at least 2 approaches
3. **Evaluate trade-offs** — performance, complexity, maintainability, accessibility
4. **Decide** — pick the option that best serves the user (children aged 4-14)
5. **Record** — log the decision in the relevant authority file or decision log

## Feature Workflow

```
Request → Classify → Route to Agent → Plan → Implement → Test → Review → Deploy
```

1. **Classify**: Is this a bug fix, feature, refactor, or config change?
2. **Route**: Which agent(s) are needed?
3. **Plan**: Agent produces implementation plan, validated against authority files
4. **Implement**: Code changes following coding standards
5. **Test**: QA agent writes/runs tests
6. **Review**: Reviewer agent checks standards compliance
7. **Deploy**: Merge to main, deploy pipeline runs

## Skills

Skills are reusable Claude Code commands that automate common workflows:

| Skill | Purpose |
|-------|---------|
| `scaffold-component` | Generate a new shadcn/ui component with tests |
| `scaffold-router` | Generate a new tRPC router with schema |
| `seed-content` | Parse and seed lesson content from files |
| `run-audit` | Run accessibility + performance audit |
| `compress-context` | Generate compressed context for next session |
| `review-pr` | Review code changes against authority files |
| `i18n-sync` | Sync translation keys across all 5 languages |

## File Structure

```
ai/
├── CLAUDE.md              ← Authority file (loaded every session)
├── AI-OS.md               ← This file (control tower docs)
├── architecture.md        ← System architecture decisions
├── coding-standards.md    ← Code style, patterns, conventions
├── design-system.md       ← UI/UX detailed rules
├── accessibility.md       ← WCAG compliance rules
├── security.md            ← Auth, data protection, COPPA
├── performance.md         ← Budgets, optimization rules
├── caching.md             ← Redis, ISR, query caching
├── observability.md       ← Logging, monitoring, error tracking
├── testing.md             ← Test strategy, coverage targets
├── ai-pipeline.md         ← AI content generation pipeline
├── decision-framework.md  ← How to make technical decisions
├── feature-workflow.md    ← Feature lifecycle process
├── data-engineering.md    ← Data models, migrations, ETL
├── context/               ← Compressed context snapshots
├── scripts/               ← Context compression & utility scripts
├── control-tower/
│   ├── agents/            ← Agent definitions
│   └── workflows/         ← Workflow definitions
└── skills/                ← Claude Code skill definitions
```
