#!/usr/bin/env node
/**
 * Control Tower — central orchestration for AI-assisted development.
 *
 * Commands:
 *   scan       — Run context scanner
 *   compress   — Build compressed context
 *   review     — Review code against authority files
 *   status     — Show project status summary
 *   route      — Suggest which agent to use for a task
 *   init       — Run scan + compress (session startup)
 *
 * Usage: node ai/control-tower/tower.js <command> [options]
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..', '..')
const CONFIG_PATH = path.join(__dirname, 'tower-config.json')
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))

// ── Command: scan ──────────────────────────────────────

function cmdScan(args) {
  const scriptPath = path.join(ROOT, 'ai', 'scripts', 'context-scan.js')
  execSync(`node "${scriptPath}" ${args.join(' ')}`, { cwd: ROOT, stdio: 'inherit' })
}

// ── Command: compress ──────────────────────────────────

function cmdCompress() {
  const scriptPath = path.join(ROOT, 'ai', 'scripts', 'context-compress.js')
  execSync(`node "${scriptPath}"`, { cwd: ROOT, stdio: 'inherit' })
}

// ── Command: review ────────────────────────────────────

function cmdReview(args) {
  const scriptPath = path.join(ROOT, 'ai', 'scripts', 'review-authority.js')
  try {
    execSync(`node "${scriptPath}" ${args.join(' ')}`, { cwd: ROOT, stdio: 'inherit' })
  } catch (err) {
    // review-authority exits with 1 on errors
    process.exit(err.status || 1)
  }
}

// ── Command: status ────────────────────────────────────

function cmdStatus() {
  console.log('ScriptureQuest — Project Status')
  console.log('================================\n')

  // Git branch
  const branch = execSafe('git branch --show-current')
  const commitCount = execSafe('git rev-list --count HEAD')
  console.log(`Branch: ${branch}`)
  console.log(`Total commits: ${commitCount}`)

  // Uncommitted changes
  const status = execSafe('git status --porcelain')
  const changedCount = status ? status.split('\n').filter(Boolean).length : 0
  console.log(`Uncommitted changes: ${changedCount}`)

  // Authority files
  const authorityCount = Object.keys(config.authorityFiles).length
  const existingAuth = Object.values(config.authorityFiles).filter((f) =>
    fs.existsSync(path.join(ROOT, f))
  ).length
  console.log(`\nAuthority files: ${existingAuth}/${authorityCount}`)

  // Agents
  const agentCount = Object.keys(config.agents).length
  const existingAgents = Object.values(config.agents).filter((a) =>
    fs.existsSync(path.join(ROOT, a.definition))
  ).length
  console.log(`Agent definitions: ${existingAgents}/${agentCount}`)

  // Skills
  const existingSkills = config.skills.filter((s) =>
    fs.existsSync(path.join(ROOT, s))
  ).length
  console.log(`Skill definitions: ${existingSkills}/${config.skills.length}`)

  // Context freshness
  const contextPath = path.join(ROOT, config.context.compressedContext)
  if (fs.existsSync(contextPath)) {
    const stat = fs.statSync(contextPath)
    const age = Date.now() - stat.mtimeMs
    const ageMinutes = Math.round(age / 60000)
    console.log(`\nCompressed context: ${ageMinutes} min old`)
  } else {
    console.log('\nCompressed context: not generated (run `tower compress`)')
  }

  // App routes
  const appDir = path.join(ROOT, 'app')
  if (fs.existsSync(appDir)) {
    let pageCount = 0
    function countPages(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
          countPages(path.join(dir, entry.name))
        } else if (entry.name === 'page.tsx') {
          pageCount++
        }
      }
    }
    countPages(appDir)
    console.log(`App routes: ${pageCount}`)
  }

  // i18n
  const messagesDir = path.join(ROOT, config.i18n.messagesDir)
  if (fs.existsSync(messagesDir)) {
    const locales = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json'))
    console.log(`i18n locales: ${locales.map((f) => f.replace('.json', '')).join(', ')}`)
  } else {
    console.log(`i18n: not yet configured (${config.i18n.locales.join(', ')} planned)`)
  }
}

// ── Command: route ─────────────────────────────────────

function cmdRoute(args) {
  const task = args.join(' ').toLowerCase()
  if (!task) {
    console.log('Usage: tower route <task description>')
    console.log('Example: tower route "add badge display component"')
    return
  }

  console.log(`Task: "${task}"\n`)

  const matches = []
  for (const [name, agent] of Object.entries(config.agents)) {
    const score = agent.triggers.reduce((acc, trigger) => {
      return acc + (task.includes(trigger) ? 1 : 0)
    }, 0)

    if (score > 0) {
      matches.push({ name, score, authorities: agent.authorities })
    }
  }

  matches.sort((a, b) => b.score - a.score)

  if (matches.length === 0) {
    console.log('No strong agent match. Suggested: architect (default)')
    console.log('Authorities to load: architecture, decisionFramework')
  } else {
    console.log('Recommended agents:')
    for (const m of matches) {
      console.log(`  ${m.name} (relevance: ${m.score})`)
      console.log(`    Load authorities: ${m.authorities.join(', ')}`)
    }
  }
}

// ── Command: init ──────────────────────────────────────

function cmdInit() {
  console.log('Initializing session...\n')
  cmdScan([])
  console.log('')
  cmdCompress()
  console.log('\nSession ready.')
}

// ── Helpers ────────────────────────────────────────────

function execSafe(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf-8' }).trim()
  } catch {
    return ''
  }
}

// ── CLI Router ─────────────────────────────────────────

const [command, ...args] = process.argv.slice(2)

const commands = {
  scan: cmdScan,
  compress: cmdCompress,
  review: cmdReview,
  status: cmdStatus,
  route: cmdRoute,
  init: cmdInit,
}

if (!command || !commands[command]) {
  console.log('ScriptureQuest Control Tower')
  console.log('============================\n')
  console.log('Commands:')
  console.log('  scan       Run context scanner')
  console.log('  compress   Build compressed context')
  console.log('  review     Review code against authority files')
  console.log('  status     Show project status summary')
  console.log('  route      Suggest agent for a task')
  console.log('  init       Scan + compress (session startup)')
  console.log('\nUsage: node ai/control-tower/tower.js <command> [options]')
  process.exit(0)
}

commands[command](args)
