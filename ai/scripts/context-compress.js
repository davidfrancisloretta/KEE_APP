#!/usr/bin/env node
/**
 * Context Compressor — builds a compressed context payload for AI sessions.
 *
 * Reads authority files, schema, recent git history, and active changes,
 * then produces a single compressed context file optimized for token efficiency.
 *
 * Usage: node ai/scripts/context-compress.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..', '..')
const AI_DIR = path.resolve(__dirname, '..')
const OUTPUT = path.join(AI_DIR, 'context', 'compressed-context.md')

// ── Helpers ────────────────────────────────────────────

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

function execSafe(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf-8' }).trim()
  } catch {
    return ''
  }
}

function summarizeMarkdown(content, maxLines = 15) {
  const lines = content.split('\n')
  const summary = []
  let inCodeBlock = false

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    // Keep headings, bullet points, and table rows
    if (
      line.startsWith('#') ||
      line.startsWith('- ') ||
      line.startsWith('| ') ||
      line.startsWith('> ')
    ) {
      summary.push(line)
    }

    if (summary.length >= maxLines) break
  }

  return summary.join('\n')
}

// ── Schema snapshot ────────────────────────────────────

function extractSchemaSnapshot() {
  const schemaPath = path.join(ROOT, 'server', 'db', 'schema.ts')
  const content = readFileSafe(schemaPath)
  if (!content) return 'Schema file not found.'

  // Extract table definitions and enums
  const tables = []
  const enums = []

  for (const line of content.split('\n')) {
    const tableMatch = line.match(/export const (\w+)\s*=\s*pgTable/)
    if (tableMatch) tables.push(tableMatch[1])

    const enumMatch = line.match(/export const (\w+)\s*=\s*pgEnum/)
    if (enumMatch) enums.push(enumMatch[1])
  }

  return `Tables: ${tables.join(', ')}\nEnums: ${enums.join(', ')}`
}

// ── Active files map ───────────────────────────────────

function getActiveFiles() {
  const status = execSafe('git status --porcelain')
  if (!status) return 'Working tree clean.'

  return status
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const status = line.substring(0, 2).trim()
      const file = line.substring(3).trim()
      const label = status === '??' ? 'NEW' : status === 'D' ? 'DEL' : 'MOD'
      return `[${label}] ${file}`
    })
    .join('\n')
}

// ── TODO/FIXME extraction ──────────────────────────────

function extractTodos() {
  const result = execSafe(
    'git grep -n "TODO\\|FIXME" -- "*.ts" "*.tsx" "*.js" "*.jsx" 2>/dev/null || true'
  )
  if (!result) return 'No TODOs found.'

  return result
    .split('\n')
    .filter(Boolean)
    .slice(0, 20)
    .map((line) => {
      // Shorten paths
      return line.replace(/^/, '  ')
    })
    .join('\n')
}

// ── Recent git history ─────────────────────────────────

function getRecentHistory() {
  return execSafe('git log --oneline -20 --format="  %h %s"')
}

// ── Branch info ────────────────────────────────────────

function getBranchInfo() {
  const branch = execSafe('git branch --show-current')
  const ahead = execSafe('git rev-list --count @{u}..HEAD 2>/dev/null || echo "?"')
  const behind = execSafe('git rev-list --count HEAD..@{u} 2>/dev/null || echo "?"')
  return `Branch: ${branch} | Ahead: ${ahead} | Behind: ${behind}`
}

// ── Authority file summaries ───────────────────────────

function summarizeAuthorities() {
  const authorityFiles = [
    'CLAUDE.md',
    'architecture.md',
    'coding-standards.md',
    'design-system.md',
    'security.md',
    'performance.md',
    'testing.md',
  ]

  const summaries = []

  for (const file of authorityFiles) {
    const content = readFileSafe(path.join(AI_DIR, file))
    if (!content) continue

    const title = content.split('\n').find((l) => l.startsWith('#'))?.replace(/^#+\s*/, '') || file
    const summary = summarizeMarkdown(content, 10)
    summaries.push(`### ${title}\n${summary}`)
  }

  return summaries.join('\n\n')
}

// ── Route map ──────────────────────────────────────────

function scanRoutes() {
  const appDir = path.join(ROOT, 'app')
  const routes = []

  function walk(dir, prefix = '') {
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue

      if (entry.isDirectory()) {
        const segment = entry.name.startsWith('(') ? '' : `/${entry.name}`
        walk(path.join(dir, entry.name), prefix + segment)
      } else if (entry.name === 'page.tsx') {
        routes.push(prefix || '/')
      }
    }
  }

  walk(appDir)
  return routes.sort().map((r) => `  ${r}`).join('\n')
}

// ── Package summary ────────────────────────────────────

function packageSummary() {
  const pkg = JSON.parse(readFileSafe(path.join(ROOT, 'package.json')) || '{}')
  const deps = Object.keys(pkg.dependencies || {}).join(', ')
  const devDeps = Object.keys(pkg.devDependencies || {}).join(', ')
  return `Dependencies: ${deps}\nDevDependencies: ${devDeps}`
}

// ── Build compressed context ───────────────────────────

function main() {
  console.log('Context Compressor')
  console.log('==================\n')

  const sections = []

  // Header
  sections.push(`# ScriptureQuest — Compressed Context`)
  sections.push(`> Generated: ${new Date().toISOString()}`)
  sections.push('')

  // Git state
  sections.push('## Git State')
  sections.push(getBranchInfo())
  sections.push('')
  sections.push('### Recent Commits')
  sections.push(getRecentHistory())
  sections.push('')
  sections.push('### Active Changes')
  sections.push(getActiveFiles())
  sections.push('')

  // Schema
  sections.push('## Database Schema')
  sections.push(extractSchemaSnapshot())
  sections.push('')

  // Routes
  sections.push('## App Routes')
  sections.push(scanRoutes())
  sections.push('')

  // Authority summaries
  sections.push('## Authority File Summaries')
  sections.push(summarizeAuthorities())
  sections.push('')

  // Package
  sections.push('## Dependencies')
  sections.push(packageSummary())
  sections.push('')

  // TODOs
  sections.push('## Open TODOs')
  sections.push(extractTodos())
  sections.push('')

  const output = sections.join('\n')

  // Write
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, output)

  // Stats
  const charCount = output.length
  const estimatedTokens = Math.ceil(charCount / 4)
  console.log(`Output: ai/context/compressed-context.md`)
  console.log(`Size: ${charCount} chars (~${estimatedTokens} tokens)`)
}

main()
