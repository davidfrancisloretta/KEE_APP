# Skill: i18n Sync

## Trigger
User asks to sync translations, add a new translation key, or check for missing translations.

## Input
- Action: `check` (find missing keys), `add` (add new key to all locales), `sync` (full sync)
- Key path (for `add`): e.g., `lessons.completionMessage`
- English value (for `add`): e.g., `"Great job! You completed the lesson!"`

## Supported Locales
| Code | Language | Script | Font Family |
|------|----------|--------|-------------|
| `en` | English | Latin | System default |
| `hi` | Hindi | Devanagari | Noto Sans Devanagari |
| `ta` | Tamil | Tamil | Noto Sans Tamil |
| `te` | Telugu | Telugu | Noto Sans Telugu |
| `kn` | Kannada | Kannada | Noto Sans Kannada |

## Process

### Check (find missing keys)
1. Read `messages/en.json` as the source of truth
2. For each locale (`hi`, `ta`, `te`, `kn`):
   - Load `messages/<locale>.json`
   - Compare keys recursively
   - Report missing keys
3. Output missing key report

### Add (new key to all locales)
1. Add key + English value to `messages/en.json`
2. For each other locale:
   - Add key with English value as placeholder
   - Mark with `"__needs_translation": true` comment convention
3. Log which files were updated

### Sync (full synchronization)
1. Run `check` to find all gaps
2. For each missing key in each locale:
   - Copy English value as placeholder
   - Mark as needing translation
3. Remove keys from locales that don't exist in English (cleanup)
4. Report summary

## File Structure
```
messages/
  en.json     ← source of truth
  hi.json     ← Hindi
  ta.json     ← Tamil
  te.json     ← Telugu
  kn.json     ← Kannada
```

## Translation Key Conventions
- Nested by feature: `lessons.title`, `quiz.submitButton`, `nav.home`
- Use camelCase for keys
- Keep values concise — UI text should be short
- Plurals: use `{count}` interpolation
- Variables: `{name}`, `{score}`, `{xp}`

## Example Structure
```json
{
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try again"
  },
  "nav": {
    "home": "Home",
    "lessons": "Lessons",
    "progress": "Progress"
  },
  "lessons": {
    "title": "My Lessons",
    "startButton": "Start Lesson",
    "completionMessage": "Great job! You earned {xp} XP!"
  },
  "quiz": {
    "submitButton": "Submit Answer",
    "hintButton": "Get a Hint",
    "scoreMessage": "You scored {score}%"
  }
}
```

## Rules
- English (`en.json`) is always the source of truth
- Never delete a key from `en.json` without removing from all locales
- All locales must have identical key structure
- Placeholder text must be in English until professionally translated
- RTL support not needed (none of the 5 languages are RTL)
