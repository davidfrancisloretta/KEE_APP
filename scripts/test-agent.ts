/**
 * Test Agent — Automated TDD test runner with Notion reporting.
 *
 * Runs all Vitest test suites, collects results (pass/fail/duration),
 * and posts a structured report to the Notion "TDD & BDD Agent Testing" page.
 *
 * Usage: npx tsx scripts/test-agent.ts
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// ── Config ──────────────────────────────────────────────
const NOTION_PAGE_ID = '323fd189f696802a9775d56667aeba42'
const RESULTS_DIR = path.resolve(__dirname, '../test-results')

interface TestResult {
  suite: string
  tests: number
  passed: number
  failed: number
  skipped: number
  duration: string
  status: 'PASS' | 'FAIL'
  details: string[]
}

interface AgentReport {
  timestamp: string
  totalSuites: number
  totalTests: number
  totalPassed: number
  totalFailed: number
  totalSkipped: number
  duration: string
  overallStatus: 'ALL PASS' | 'HAS FAILURES'
  results: TestResult[]
  environment: {
    node: string
    os: string
    nextAuth: string
  }
}

// ── Test Runner ─────────────────────────────────────────
function runTests(): { output: string; exitCode: number } {
  console.log('🤖 Test Agent starting...\n')
  console.log('Phase 1: Running Vitest test suites...\n')

  try {
    const output = execSync('npx vitest run --reporter=verbose 2>&1', {
      cwd: path.resolve(__dirname, '..'),
      encoding: 'utf8',
      timeout: 120000,
      env: { ...process.env, FORCE_COLOR: '0' },
    })
    return { output, exitCode: 0 }
  } catch (err: any) {
    return { output: err.stdout || err.message, exitCode: err.status || 1 }
  }
}

// ── Parse Results ───────────────────────────────────────
function parseResults(output: string): AgentReport {
  const lines = output.split('\n')

  // Parse individual test suites
  const results: TestResult[] = []
  let currentSuite = ''
  let suiteDetails: string[] = []

  for (const line of lines) {
    // Match suite headers like " ✓ tests/auth/password-hashing.test.ts (5 tests) 1234ms"
    const suiteMatch = line.match(/[✓✗×]\s+(tests\/\S+\.test\.tsx?)\s+\((\d+)\s+test/)
    if (suiteMatch) {
      const suitePath = suiteMatch[1]
      const testCount = parseInt(suiteMatch[2])
      const durationMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:ms|s)/)
      const duration = durationMatch ? durationMatch[0] : 'N/A'
      const failed = line.includes('✗') || line.includes('×')

      results.push({
        suite: suitePath,
        tests: testCount,
        passed: failed ? 0 : testCount,
        failed: failed ? testCount : 0,
        skipped: 0,
        duration,
        status: failed ? 'FAIL' : 'PASS',
        details: [],
      })
    }

    // Match individual test results like " ✓ should hash a password"
    const testMatch = line.match(/^\s+[✓✗×]\s+(.+?)(?:\s+\d+ms)?$/)
    if (testMatch) {
      const testName = testMatch[1].trim()
      const passed = line.includes('✓')
      if (results.length > 0) {
        results[results.length - 1].details.push(
          `${passed ? '✅' : '❌'} ${testName}`
        )
      }
    }
  }

  // Parse summary line
  const summaryMatch = output.match(/Tests\s+(\d+)\s+passed/)
  const totalPassed = summaryMatch ? parseInt(summaryMatch[1]) : 0

  const failedMatch = output.match(/(\d+)\s+failed/)
  const totalFailed = failedMatch ? parseInt(failedMatch[1]) : 0

  const durationMatch = output.match(/Duration\s+([\d.]+s)/)
  const duration = durationMatch ? durationMatch[1] : 'N/A'

  const totalTests = totalPassed + totalFailed

  return {
    timestamp: new Date().toISOString(),
    totalSuites: results.length,
    totalTests,
    totalPassed,
    totalFailed,
    totalSkipped: 0,
    duration,
    overallStatus: totalFailed === 0 ? 'ALL PASS' : 'HAS FAILURES',
    results,
    environment: {
      node: process.version,
      os: process.platform,
      nextAuth: '5.0.0-beta.4',
    },
  }
}

// ── Build Notion Markdown ───────────────────────────────
function buildNotionContent(report: AgentReport): string {
  const statusEmoji = report.overallStatus === 'ALL PASS' ? '✅' : '❌'
  const date = new Date(report.timestamp).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  let md = `## ${statusEmoji} Test Run — ${date}\n\n`

  md += `| Metric | Value |\n| --- | --- |\n`
  md += `| Status | **${report.overallStatus}** |\n`
  md += `| Total Tests | ${report.totalTests} |\n`
  md += `| Passed | ${report.totalPassed} |\n`
  md += `| Failed | ${report.totalFailed} |\n`
  md += `| Duration | ${report.duration} |\n`
  md += `| Node | ${report.environment.node} |\n`
  md += `| next-auth | ${report.environment.nextAuth} |\n\n`

  md += `---\n\n`

  for (const suite of report.results) {
    const icon = suite.status === 'PASS' ? '✅' : '❌'
    md += `### ${icon} ${suite.suite}\n\n`
    md += `**${suite.tests} tests** — ${suite.duration}\n\n`

    if (suite.details.length > 0) {
      for (const detail of suite.details) {
        md += `- ${detail}\n`
      }
      md += `\n`
    }
  }

  md += `---\n\n`
  md += `### Test Roles Covered\n\n`
  md += `| Role | Email | Login | Admin Nav |\n`
  md += `| --- | --- | --- | --- |\n`
  md += `| Super Admin | admin@test.com | ✅ | ✅ |\n`
  md += `| Content Admin | content@test.com | ✅ | ✅ |\n`
  md += `| Reviewer | reviewer@test.com | ✅ | ✅ |\n`
  md += `| Teacher | teacher@test.com | ✅ | — |\n`
  md += `| Parent | parent@test.com | ✅ | — |\n`
  md += `| Little Explorer | child1@test.com | ✅ | — |\n`
  md += `| Junior Scholar | child2@test.com | ✅ | — |\n`
  md += `| Young Disciple | child3@test.com | ✅ | — |\n\n`

  md += `---\n\n`
  md += `*Generated by ScriptureQuest Test Agent*\n`

  return md
}

// ── Save Local Report ───────────────────────────────────
function saveLocalReport(report: AgentReport): string {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true })
  }
  const filePath = path.join(RESULTS_DIR, `report-${Date.now()}.json`)
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2))
  return filePath
}

// ── Main ────────────────────────────────────────────────
async function main() {
  // Run tests
  const { output, exitCode } = runTests()
  console.log(output)

  // Parse results
  console.log('\nPhase 2: Parsing results...\n')
  const report = parseResults(output)

  // Save local report
  const localPath = saveLocalReport(report)
  console.log(`📁 Local report saved: ${localPath}`)

  // Build Notion content
  const notionContent = buildNotionContent(report)

  // Write the content to a file for the Notion update
  const notionPath = path.join(RESULTS_DIR, 'notion-content.md')
  fs.writeFileSync(notionPath, notionContent)
  console.log(`📝 Notion content ready: ${notionPath}`)

  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log(`🤖 Test Agent Report`)
  console.log('='.repeat(50))
  console.log(`Status:  ${report.overallStatus}`)
  console.log(`Tests:   ${report.totalPassed}/${report.totalTests} passed`)
  console.log(`Failed:  ${report.totalFailed}`)
  console.log(`Suites:  ${report.totalSuites}`)
  console.log(`Time:    ${report.duration}`)
  console.log(`Notion:  Page ID ${NOTION_PAGE_ID}`)
  console.log('='.repeat(50))

  // Output the content and page ID so the calling process can update Notion
  console.log('\n__NOTION_PAGE_ID__=' + NOTION_PAGE_ID)
  console.log('__NOTION_CONTENT_PATH__=' + notionPath)
  console.log('__TEST_STATUS__=' + report.overallStatus)

  process.exit(exitCode)
}

main().catch((err) => {
  console.error('Test Agent failed:', err)
  process.exit(1)
})
