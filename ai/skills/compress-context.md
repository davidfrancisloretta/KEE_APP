# Skill: Compress Context

## Trigger
User asks to prepare context for a new session, or at the start of a long task.

## Input
- None required (auto-detects project state)

## Process

1. **Run context scanner**:
   ```bash
   node ai/scripts/context-scan.js
   ```
   - Inventories all project files
   - Categorizes by type (component, router, schema, etc.)
   - Detects git changes

2. **Run context compressor**:
   ```bash
   node ai/scripts/context-compress.js
   ```
   - Summarizes authority files
   - Snapshots schema (table and enum names)
   - Lists app routes
   - Captures recent git history
   - Extracts open TODOs
   - Outputs to `ai/context/compressed-context.md`

3. **Report token budget**:
   - Target: <8000 tokens for compressed context
   - If over budget, suggest which authority files to trim

## Shortcut
```bash
node ai/control-tower/tower.js init
```
Runs both scan and compress in sequence.

## Output
- `ai/context/scan-manifest.json` — full file inventory
- `ai/context/compressed-context.md` — token-efficient session context

## When to Use
- Start of every new Claude session
- Before a large implementation task
- After significant project changes
- When context window is running low
