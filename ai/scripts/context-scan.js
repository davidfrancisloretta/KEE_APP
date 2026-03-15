#!/usr/bin/env node
/**
 * Context Scanner — inventories project files, detects changes since last scan.
 *
 * Outputs a manifest of all project files with metadata:
 *   - file path, size, last modified
 *   - git status (modified, new, deleted)
 *   - category (component, router, schema, test, config, authority)
 *
 * Usage: node ai/scripts/context-scan.js [--diff] [--since <commit>]
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..', '..')
const OUTPUT = path.join(__dirname, '..', 'context', 'scan-manifest.json')

// ── File categorization ────────────────────────────────

const CATEGORY_RULES = [
  { pattern: /^ai\//, category: 'authority' },
  { pattern: /^server\/db\/schema/, category: 'schema' },
  { pattern: /^server\/routers\//, category: 'router' },
  { pattern: /^server\//, category: 'server' },
  { pattern: /^app\/api\//, category: 'api-route' },
  { pattern: /^app\/.*page\.tsx$/, category: 'page' },
  { pattern: /^app\/.*layout\.tsx$/, category: 'layout' },
  { pattern: /^components\//, category: 'component' },
  { pattern: /^lib\//, category: 'lib' },
  { pattern: /^scripts\//, category: 'script' },
  { pattern: /\.test\.(ts|tsx)$/, category: 'test' },
  { pattern: /^(package|tsconfig|next\.config|drizzle\.config|postcss|tailwind)/, category: 'config' },
  { pattern: /\.(md|mdx)$/, category: 'docs' },
  { pattern: /^public\//, category: 'static' },
  { pattern: /^messages\//, category: 'i18n' },
]

function categorize(filePath) {
  const rel = filePath.replace(/\\/g, '/')
  for (const { pattern, category } of CATEGORY_RULES) {
    if (pattern.test(rel)) return category
  }
  return 'other'
}

// ── Git helpers ────────────────────────────────────────

function getGitStatus() {
  try {
    const raw = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf-8' })
    const entries = {}
    for (const line of raw.trim().split('\n')) {
      if (!line.trim()) continue
      const status = line.substring(0, 2).trim()
      const file = line.substring(3).trim()
      entries[file] = status === '??' ? 'new' : status === 'D' ? 'deleted' : 'modified'
    }
    return entries
  } catch {
    return {}
  }
}

function getRecentCommits(count = 20) {
  try {
    const raw = execSync(
      `git log --oneline -${count} --format="%h|%s|%ai"`,
      { cwd: ROOT, encoding: 'utf-8' }
    )
    return raw.trim().split('\n').filter(Boolean).map((line) => {
      const [hash, subject, date] = line.split('|')
      return { hash, subject, date }
    })
  } catch {
    return []
  }
}

function getChangedFilesSince(since) {
  try {
    const raw = execSync(`git diff --name-only ${since}`, { cwd: ROOT, encoding: 'utf-8' })
    return raw.trim().split('\n').filter(Boolean)
  } catch {
    return []
  }
}

// ── File scanning ──────────────────────────────────────

const IGNORE = [
  'node_modules', '.next', '.git', 'dist', 'build', '.env',
  'package-lock.json', '.DS_Store', 'Thumbs.db',
  // Content folders (large binary files)
  'Beginners', 'Biblical Doctrines', 'Biblical Covenants',
]

function shouldIgnore(name) {
  return IGNORE.some((ig) => name === ig || name.startsWith(ig + '/'))
}

function scanDir(dir, relativeTo = ROOT) {
  const results = []
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return results
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relPath = path.relative(relativeTo, fullPath).replace(/\\/g, '/')

    if (shouldIgnore(entry.name) || shouldIgnore(relPath)) continue

    if (entry.isDirectory()) {
      results.push(...scanDir(fullPath, relativeTo))
    } else if (entry.isFile()) {
      try {
        const stat = fs.statSync(fullPath)
        results.push({
          path: relPath,
          size: stat.size,
          modified: stat.mtime.toISOString(),
          category: categorize(relPath),
        })
      } catch {
        // Skip unreadable files
      }
    }
  }
  return results
}

// ── Main ───────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2)
  const showDiff = args.includes('--diff')
  const sinceIdx = args.indexOf('--since')
  const since = sinceIdx !== -1 ? args[sinceIdx + 1] : null

  console.log('Context Scanner')
  console.log('===============\n')

  // Scan files
  const files = scanDir(ROOT)
  console.log(`Scanned ${files.length} files`)

  // Git status
  const gitStatus = getGitStatus()
  for (const file of files) {
    file.gitStatus = gitStatus[file.path] || 'clean'
  }

  // Summary by category
  const categories = {}
  for (const file of files) {
    categories[file.category] = (categories[file.category] || 0) + 1
  }
  console.log('\nBy category:')
  for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`)
  }

  // Changed files
  const changed = files.filter((f) => f.gitStatus !== 'clean')
  if (changed.length > 0) {
    console.log(`\nChanged files (${changed.length}):`)
    for (const f of changed) {
      console.log(`  [${f.gitStatus}] ${f.path}`)
    }
  }

  // Recent commits
  const commits = getRecentCommits()

  // Changed since specific commit
  let changedSince = []
  if (since) {
    changedSince = getChangedFilesSince(since)
    console.log(`\nChanged since ${since}: ${changedSince.length} files`)
  }

  // Build manifest
  const manifest = {
    scannedAt: new Date().toISOString(),
    totalFiles: files.length,
    categories,
    recentCommits: commits,
    changedSince: since ? { ref: since, files: changedSince } : null,
    files: showDiff ? files.filter((f) => f.gitStatus !== 'clean') : files,
  }

  // Write output
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2))
  console.log(`\nManifest written to: ai/context/scan-manifest.json`)
}

main()
