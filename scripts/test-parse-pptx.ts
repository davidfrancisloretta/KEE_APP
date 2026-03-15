/**
 * Test script — parse a CC PPT .pptx file and display the result
 * Usage: npx tsx scripts/test-parse-pptx.ts
 */

import { parseLesson, MODALITY_META, type LearningModality } from './parse-content'

async function main() {
  const testFile = './CC PPT/Exodus.pptx'
  console.log(`\n📄 Parsing: ${testFile}\n`)

  const lesson = await parseLesson(testFile, 'junior-scholars')

  console.log(`📌 Title: ${lesson.title}`)
  console.log(`📖 Description: ${lesson.description}`)
  console.log(`🙏 Memory Verse: ${lesson.memoryVerse || '(none found)'}`)
  console.log(`📜 Scripture: ${lesson.scripturePortion}`)
  console.log(`🎯 Objectives: ${lesson.objectives.length}`)
  lesson.objectives.forEach((o, i) => console.log(`   ${i + 1}. ${o}`))

  console.log(`\n📚 Steps: ${lesson.steps.length}`)
  for (const step of lesson.steps) {
    const modalities = step.content.learningModalities
      .map((m: LearningModality) => `${MODALITY_META[m].icon} ${m}`)
      .join(', ')
    console.log(`   ${step.stepOrder}. [${step.type}] ${step.content.heading} — ${modalities}`)
    console.log(`      ${step.content.text.substring(0, 120)}...`)
  }

  console.log(`\n❓ Quiz Questions: ${lesson.quizQuestions.length}`)
  lesson.quizQuestions.forEach((q, i) => console.log(`   ${i + 1}. ${q.questionText}`))

  console.log(`\n⏱️  Estimated: ${lesson.estimatedMinutes} min`)
  console.log(`⭐ XP: ${lesson.xpReward}`)
  console.log(`\n🎓 Modality Coverage: ${lesson.modalityCoverage.map((m: LearningModality) => `${MODALITY_META[m].icon} ${m}`).join(', ')}`)

  const allSix: LearningModality[] = ['READ', 'WRITE', 'LISTEN', 'SPEAK', 'THINK', 'OBSERVE']
  const missing = allSix.filter(m => !lesson.modalityCoverage.includes(m))
  if (missing.length > 0) {
    console.log(`⚠️  Missing modalities: ${missing.join(', ')}`)
  } else {
    console.log(`✅ All 6 modalities covered!`)
  }
}

main().catch(console.error)
