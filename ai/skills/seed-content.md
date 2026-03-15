# Skill: Seed Content

## Trigger
User asks to parse and seed lesson content from document files.

## Input
- Content folder path
- Age group target
- File format (DOCX or PDF)

## Process

1. **Scan the folder** for lesson files
   - Flat: `*.pdf` / `*.docx` directly in folder
   - Nested: `Lesson N/` subfolders with files inside

2. **Parse each file** using `scripts/parse-content.ts`
   - Extract text (mammoth for DOCX, PyPDF2 for PDF)
   - Detect sections via regex patterns
   - Build structured lesson data
   - Extract quiz questions from "Ask:" patterns

3. **Validate parsed data**
   - Title present and reasonable length
   - At least 1 objective
   - Memory verse extracted
   - At least 1 lesson step with content
   - Quiz questions are well-formed

4. **Seed to database** using Drizzle ORM
   - Create/find series
   - Insert lessons with steps
   - Create quizzes with questions
   - Award appropriate XP per age group

5. **Report results**
   - Lessons inserted
   - Steps created
   - Quiz questions generated
   - Any parse errors

## Command
```bash
npx tsx scripts/seed.ts
```

## Content Sources
| Folder | Age Group | Pattern |
|--------|-----------|---------|
| `Beginners/` | little-explorers | flat (PDFs) |
| `Biblical Doctrines/Level 1/` | junior-scholars | nested (DOCX) |
| `Biblical Doctrines/Level 2&3/` | young-disciples | nested (DOCX) |
| `Biblical Covenants/Level 1/` | junior-scholars | nested (DOCX) |
| `Biblical Covenants/Level 2 &3/` | young-disciples | nested (DOCX) |
