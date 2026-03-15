import mammoth from 'mammoth'

async function main() {
  const docxPath = './Biblical Doctrines/Level 1/Lesson 1/Bible Doctrine Level 1 Lesson 1 .docx'
  const result = await mammoth.extractRawText({ path: docxPath })
  const full = result.value
  console.log('TOTAL LENGTH:', full.length)
  // Print from 6000 onwards
  console.log(full.substring(6000, 13000))
}

main().catch(console.error)
