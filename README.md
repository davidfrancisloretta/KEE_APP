# ScriptureQuest — Kingdom Educational Experience (KEE)

An interactive scripture learning platform for children aged 4–14, featuring gamified lessons, quizzes, progress tracking, and multi-language support across 5 Indian languages.

## Features

### For Students
- **Lesson Player** — Multi-step interactive lessons with narration, illustrations, and activities
- **Quiz Engine** — Multiple question types (multiple choice, true/false, fill-in-the-blank, drag & drop) with progressive hint system
- **Gamification** — XP rewards, badges, daily streaks, and leaderboard
- **Progress Dashboard** — Track XP, level, completed lessons, and earned badges

### For Parents & Teachers
- **Parent Dashboard** — Monitor children's learning activity and progress
- **Teacher Dashboard** — Manage students and review their progress

### For Admins
- **Content Upload Pipeline** — Upload DOCX, PPTX, and PDF curriculum files
- **AI-Assisted Parsing** — Automated extraction of lesson structure, objectives, scripture references, and memory verses
- **Review & Approval Workflow** — Draft → AI Processing → Review → Approved → Published

### Internationalization (5 Languages)
| Code | Language | Script |
|------|----------|--------|
| `en` | English | Latin |
| `hi` | हिन्दी (Hindi) | Devanagari |
| `ta` | தமிழ் (Tamil) | Tamil |
| `te` | తెలుగు (Telugu) | Telugu |
| `kn` | ಕನ್ನಡ (Kannada) | Kannada |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.3 |
| Styling | Tailwind CSS v4, Framer Motion |
| State | Zustand, React Query |
| API | tRPC v10 |
| Auth | Auth.js v5 (JWT sessions, Credentials provider) |
| Database | PostgreSQL 16 (Drizzle ORM) |
| Cache | Redis 7 |
| i18n | next-intl |
| Testing | Vitest, Testing Library |
| Content Parsing | mammoth (DOCX), officeparser (PPTX), pdf-parse (PDF) |

## Age Groups

| Group | Ages | Session Length | XP/Lesson |
|-------|------|---------------|-----------|
| Little Explorers | 4–6 | 10–15 min | 10 XP |
| Junior Scholars | 7–10 | 15–25 min | 15 XP |
| Young Disciples | 11–14 | 20–30 min | 20 XP |

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### 1. Clone & Install

```bash
git clone https://github.com/davidfrancisloretta/KEE_APP.git
cd KEE_APP
npm install
```

### 2. Start Database & Cache

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL 16** on port `5433`
- **Redis 7** on port `6379`

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your `NEXTAUTH_SECRET`:

```env
DATABASE_URL=postgresql://sq:sq@localhost:5433/scripturequest
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-a-secret>
REDIS_URL=redis://localhost:6379
```

### 4. Initialize Database

```bash
npm run db:push
npm run seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio (visual DB editor) |
| `npm run seed` | Seed lesson content from curriculum files |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/                # REST & tRPC endpoints
│   └── [locale]/           # Locale-prefixed routes
│       ├── (auth)/         # Login, Register
│       ├── (learn)/        # Lessons, Quizzes, Progress
│       ├── (dashboard)/    # Parent & Teacher dashboards
│       └── (admin)/        # Admin panel
├── components/             # React components
│   ├── auth/               # Auth forms
│   ├── learn/              # Lesson player, quiz engine, progress
│   ├── providers/          # Auth & tRPC providers
│   └── ui/                 # Navigation, cards, mascot (Ezra the Owl)
├── server/                 # Backend
│   ├── db/                 # Drizzle schema & client
│   ├── routers/            # tRPC routers
│   ├── auth.ts             # Auth.js configuration
│   └── trpc.ts             # tRPC context & procedures
├── i18n/                   # Internationalization config
├── messages/               # Translation JSON files (en, hi, ta, te, kn)
├── scripts/                # Seed, parse, and utility scripts
├── ai/                     # AI development guidelines & pipeline docs
├── tests/                  # Vitest test suites
├── Beginners/              # Beginner curriculum PDFs (32 lessons)
├── Biblical Covenants/     # Covenant curriculum (Levels 1–3)
├── Biblical Doctrines/     # Doctrine curriculum (Levels 1–3)
└── CC PPT/                 # PowerPoint presentations
```

## Content Pipeline

The 6-stage content pipeline transforms uploaded curriculum documents into interactive lessons:

1. **Ingest** — Accept DOCX/PPTX/PDF files (max 50 MB)
2. **Extract** — Parse document content using mammoth, officeparser, or pdf-parse
3. **Parse** — Detect sections via regex (title, objectives, scripture, memory verse)
4. **Enrich** — AI-assisted question generation, summaries, and translations
5. **Review** — Admin/teacher approval workflow
6. **Publish** — Database insertion and cache invalidation

### Learning Modalities

Each lesson incorporates 6 learning modalities:

- **Read** — Scripture passages and memory verses
- **Write** — Fill-in exercises, journaling, application
- **Listen** — Narration and Bible stories
- **Speak** — Discussion, prayer, recitation
- **Think** — Reflection and application questions
- **Observe** — Illustrations, games, and crafts

## Database Schema

Key tables: `users`, `lessons`, `lessonSteps`, `series`, `quizzes`, `questions`, `quizAttempts`, `userProgress`, `badges`, `userBadges`, `streaks`, `contentUploads`, `lessonReviews`

**User Roles:** child, parent, teacher, content_admin, super_admin, reviewer

**Lesson Lifecycle:** draft → ai_processing → review → approved → published → archived

## License

Private — All rights reserved.
