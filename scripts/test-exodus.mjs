import { parseOffice } from 'officeparser'
import path from 'path'

const filePath = path.resolve('uploads/1773500275733-Exodus.pptx')
console.log('Parsing:', filePath)

try {
  const ast = await parseOffice(filePath)
  const text = ast.toText()
  console.log('TEXT LENGTH:', text.length)
  console.log('FIRST 2000 CHARS:')
  console.log(text.substring(0, 2000))
  console.log('---')

  // Check section detection
  const lines = text.split('\n')
  console.log('TOTAL LINES:', lines.length)
  const sectionPatterns = [
    { key: 'objectives', pattern: /learning\s*objectives?|objectives?:/i },
    { key: 'scripture', pattern: /scripture\s*(portion|reference)|scripture:/i },
    { key: 'memoryVerse', pattern: /memory\s*verse/i },
    { key: 'attentionGetter', pattern: /attention\s*getter|introduction/i },
    { key: 'bibleStory', pattern: /big\s*bible\s*story|bible\s*narrative|teaching\s*content/i },
    { key: 'craft', pattern: /craft/i },
    { key: 'game', pattern: /game|activity/i },
    { key: 'application', pattern: /life\s*application|application|what\s*does\s*this\s*mean/i },
    { key: 'prayer', pattern: /closing\s*prayer|prayer\s*&?\s*blessing|prayer/i },
  ]

  let detected = 0
  for (const line of lines) {
    for (const { key, pattern } of sectionPatterns) {
      if (pattern.test(line.trim())) {
        console.log(`  SECTION [${key}] at: "${line.trim().substring(0, 80)}"`)
        detected++
      }
    }
  }
  console.log('SECTIONS DETECTED:', detected)
} catch (err) {
  console.error('PARSE ERROR:', err.message)
  console.error(err.stack)
}
