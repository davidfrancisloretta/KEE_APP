# AI Pipeline Authority

## Content Generation Pipeline

### Purpose
Automate the transformation of raw lesson documents (DOCX/PPTX/PDF) into structured, interactive learning content suitable for each age group.

### Pipeline Stages

```
1. Ingest → 2. Extract → 3. Parse → 4. Enrich → 5. Review → 6. Publish
```

#### Stage 1: Ingest
- Accept DOCX, PPTX, and PDF files via admin upload UI or file system scan
- Validate file type and size (max 50MB)
- Store original in content archive
- Auto-trigger parse via `/api/admin/parse` after upload

#### Stage 2: Extract
- DOCX: mammoth library → raw text
- PPTX: officeparser library → raw text from all slides
- PDF: PyPDF2 via Python subprocess → raw text
- Preserve paragraph structure

#### Stage 3: Parse
- Section detection via regex patterns (see `scripts/parse-content.ts`)
- Extract: title, objectives, scripture, memory verse
- Build lesson steps: attention getter, bible story, craft, game, application, prayer
- Extract quiz questions from "Ask:" patterns
- Tag each step with learning modalities

#### Stage 4: Enrich (Future — AI-assisted)
- Generate additional quiz questions per age group
- Create age-appropriate summaries
- Suggest illustration prompts
- Generate memory verse activities
- Translate content to supported languages

#### Stage 5: Review
- Teacher/admin reviews parsed content at `/admin/review`
- Verify quiz answers are correct
- Adjust age group difficulty
- Approve, request revision, or reject

#### Stage 6: Publish
- Insert into database via Drizzle
- Invalidate content caches
- Notify subscribed users of new content

## Learning Framework — 6 Modalities

Every lesson must be designed with the following six learning modalities. Each lesson step is tagged with its primary modality so learners engage through multiple channels.

| Modality | Icon | Description | Lesson Section |
|----------|------|-------------|----------------|
| **READ** | 📖 | Scripture text, memory verse, lesson text | Bible Story, Memory Verse |
| **WRITE** | ✏️ | Fill-in activities, journaling, application exercises | Application |
| **LISTEN** | 👂 | Teacher narration, Bible narrative, SAY: sections | Bible Story, Teaching Content |
| **SPEAK** | 💬 | Discussion questions, ASK: prompts, prayer, recitation | Attention Getter, Prayer |
| **THINK** | 🧠 | Reflection, life application, "What does this mean for me?" | Application, Life Application |
| **OBSERVE** | 👁️ | Illustrations, games, craft activities, visual demonstrations | Attention Getter, Craft, Game |

### Section → Modality Mapping

```
attentionGetter  → OBSERVE + SPEAK
bibleStory       → LISTEN + READ
craft            → OBSERVE
game             → OBSERVE + SPEAK
application      → THINK + WRITE
prayer           → SPEAK
memoryVerse      → READ + SPEAK
```

## Content Quality Rules

- Every lesson must have ≥1 objective
- Every lesson must have a memory verse
- Every lesson must include all 6 modalities across its steps
- Quiz questions: minimum 3 per lesson
- Step content: minimum 10 characters per step
- No duplicate lessons (check by title + series)
- Each step must be tagged with `learningModalities: string[]` in the JSONB `content` field

## Age Group Adaptation

| Aspect | Little Explorers | Junior Scholars | Young Disciples |
|--------|-----------------|-----------------|-----------------|
| Reading level | Simple, short sentences | Moderate complexity | Full text |
| Quiz type | True/False, visual | Multiple choice | All types + fill blank |
| Hints | 3, very explicit | 3, moderate guidance | 2, subtle |
| XP per lesson | 10 | 15 | 20 |
| Estimated time | 10-15 min | 15-25 min | 20-30 min |
