#!/usr/bin/env node
/**
 * Authority Review — checks code changes against authority file rules.
 *
 * Scans staged or recent changes and reports potential violations of:
 *   - Coding standards (naming, imports, patterns)
 *   - Architecture rules (file placement, component patterns)
 *   - Security concerns (hardcoded secrets, missing validation)
 *   - Accessibility issues (missing aria, small touch targets)
 *
 * Usage: node ai/scripts/review-authority.js [--staged] [--since <commit>]
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..', '..')

// ── Rules ──────────────────────────────────────────────

const RULES = [
  {
    id: 'no-any',
    severity: 'error',
    description: 'No `any` type — use `unknown` + type guards',
    pattern: /:\s*any\b/,
    filePattern: /\.(ts|tsx)$/,
    exclude: /\.d\.ts$/,
  },
  {
    id: 'no-default-export',
    severity: 'warn',
    description: 'Prefer named exports (except Next.js pages)',
    pattern: /^export default /m,
    filePattern: /\.(ts|tsx)$/,
    exclude: /page\.tsx$|layout\.tsx$|loading\.tsx$|error\.tsx$|route\.ts$/,
  },
  {
    id: 'no-star-import-schema',
    severity: 'error',
    description: 'Use named imports from schema, not import *',
    pattern: /import\s+\*\s+as\s+\w+\s+from\s+['"].*schema/,
    filePattern: /\.(ts|tsx)$/,
  },
  {
    id: 'no-pages-router',
    severity: 'error',
    description: 'No Pages Router patterns (getServerSideProps, getStaticProps)',
    pattern: /export\s+(async\s+)?function\s+getS(erver|tatic)/,
    filePattern: /\.(ts|tsx)$/,
  },
  {
    id: 'no-raw-img',
    severity: 'warn',
    description: 'Use next/image instead of raw <img>',
    pattern: /<img\s/,
    filePattern: /\.tsx$/,
  },
  {
    id: 'no-console-log',
    severity: 'warn',
    description: 'Remove console.log in production code (use structured logging)',
    pattern: /console\.log\(/,
    filePattern: /\.(ts|tsx)$/,
    exclude: /scripts\/|seed\.ts|\.test\./,
  },
  {
    id: 'no-hardcoded-secrets',
    severity: 'error',
    description: 'No hardcoded API keys, passwords, or secrets',
    pattern: /(api[_-]?key|password|secret)\s*[:=]\s*['"][^'"]{8,}['"]/i,
    filePattern: /\.(ts|tsx|js|json)$/,
    exclude: /\.env\.example|package(-lock)?\.json/,
  },
  {
    id: 'no-raw-sql',
    severity: 'error',
    description: 'Use Drizzle query builder, not raw SQL',
    pattern: /sql`|\.execute\(\s*['"`]/,
    filePattern: /\.(ts|tsx)$/,
    exclude: /schema\.ts|migration/,
  },
  {
    id: 'missing-use-client',
    severity: 'warn',
    description: 'Files using hooks should have "use client" directive',
    pattern: /\b(useState|useEffect|useRef|useRouter|usePathname)\s*\(/,
    filePattern: /\.tsx$/,
    customCheck: (content) => {
      const usesHook = /\b(useState|useEffect|useRef|useRouter|usePathname)\s*\(/.test(content)
      const hasDirective = content.trimStart().startsWith("'use client'") || content.trimStart().startsWith('"use client"')
      return usesHook && !hasDirective
    },
  },
  {
    id: 'trpc-zod-validation',
    severity: 'warn',
    description: 'tRPC procedures should use Zod input validation',
    pattern: /\.(mutation|query)\(\s*(?:async\s*)?\(/,
    filePattern: /\.router\.ts$/,
    customCheck: (content) => {
      // Check if any procedure lacks .input()
      const procedures = content.match(/\.(mutation|query)\(\s*(?:async\s*)?\(/g) || []
      if (procedures.length === 0) return false
      // Simple heuristic: if there are procedures but no .input( calls
      const inputs = content.match(/\.input\(/g) || []
      return procedures.length > inputs.length + 1 // Allow 1 no-input procedure
    },
  },
  {
    id: 'accessibility-aria',
    severity: 'warn',
    description: 'Icon-only buttons need aria-label',
    pattern: /<button[^>]*>\s*<(?:svg|Icon|Lucide)/,
    filePattern: /\.tsx$/,
    customCheck: (content) => {
      const iconButtons = content.match(/<button[^>]*>\s*<(?:svg|Icon|\w+Icon)/g) || []
      return iconButtons.some((btn) => !btn.includes('aria-label'))
    },
  },
]

// ── File discovery ─────────────────────────────────────

function getFilesToReview(args) {
  if (args.includes('--staged')) {
    const raw = execSync('git diff --cached --name-only', { cwd: ROOT, encoding: 'utf-8' })
    return raw.trim().split('\n').filter(Boolean)
  }

  const sinceIdx = args.indexOf('--since')
  if (sinceIdx !== -1) {
    const ref = args[sinceIdx + 1]
    const raw = execSync(`git diff --name-only ${ref}`, { cwd: ROOT, encoding: 'utf-8' })
    return raw.trim().split('\n').filter(Boolean)
  }

  // Default: all uncommitted changes
  const raw = execSync('git diff --name-only HEAD 2>/dev/null || git diff --name-only', {
    cwd: ROOT,
    encoding: 'utf-8',
  })
  return raw.trim().split('\n').filter(Boolean)
}

// ── Review logic ───────────────────────────────────────

function reviewFile(filePath, content) {
  const violations = []

  for (const rule of RULES) {
    // Check file pattern
    if (rule.filePattern && !rule.filePattern.test(filePath)) continue
    if (rule.exclude && rule.exclude.test(filePath)) continue

    let violated = false

    if (rule.customCheck) {
      violated = rule.customCheck(content)
    } else {
      violated = rule.pattern.test(content)
    }

    if (violated) {
      // Find line numbers
      const lines = content.split('\n')
      const matchingLines = []
      for (let i = 0; i < lines.length; i++) {
        if (rule.pattern.test(lines[i])) {
          matchingLines.push(i + 1)
        }
      }

      violations.push({
        ruleId: rule.id,
        severity: rule.severity,
        description: rule.description,
        file: filePath,
        lines: matchingLines.slice(0, 5),
      })
    }
  }

  return violations
}

// ── Main ───────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2)

  console.log('Authority Review')
  console.log('================\n')

  const files = getFilesToReview(args)
  if (files.length === 0) {
    console.log('No files to review.')
    return
  }

  console.log(`Reviewing ${files.length} files...\n`)

  let totalErrors = 0
  let totalWarnings = 0
  const allViolations = []

  for (const file of files) {
    const fullPath = path.join(ROOT, file)
    if (!fs.existsSync(fullPath)) continue

    const content = fs.readFileSync(fullPath, 'utf-8')
    const violations = reviewFile(file, content)

    for (const v of violations) {
      allViolations.push(v)
      if (v.severity === 'error') totalErrors++
      else totalWarnings++
    }
  }

  // Print results
  if (allViolations.length === 0) {
    console.log('No violations found.')
    return
  }

  for (const v of allViolations) {
    const icon = v.severity === 'error' ? 'ERROR' : 'WARN '
    const lineInfo = v.lines.length > 0 ? `:${v.lines.join(',')}` : ''
    console.log(`  [${icon}] ${v.file}${lineInfo}`)
    console.log(`         ${v.ruleId}: ${v.description}`)
  }

  console.log(`\nResults: ${totalErrors} errors, ${totalWarnings} warnings`)

  if (totalErrors > 0) {
    process.exit(1)
  }
}

main()
