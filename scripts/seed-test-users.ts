// Seed test users for every role — one-click dev login support.
// Usage: npx tsx scripts/seed-test-users.ts

import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { users } from '../server/db/schema'

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://sq:sq@localhost:5433/scripturequest'

const TEST_PASSWORD = 'test1234'

const testUsers = [
  { email: 'admin@test.com',    name: 'Admin User',   role: 'super_admin'   as const, ageGroup: null },
  { email: 'content@test.com',  name: 'Content Admin', role: 'content_admin' as const, ageGroup: null },
  { email: 'reviewer@test.com', name: 'Reviewer',     role: 'reviewer'      as const, ageGroup: null },
  { email: 'teacher@test.com',  name: 'Teacher User', role: 'teacher'       as const, ageGroup: null },
  { email: 'parent@test.com',   name: 'Parent User',  role: 'parent'        as const, ageGroup: null },
  { email: 'child1@test.com',   name: 'Little Explorer', role: 'child'      as const, ageGroup: 'little-explorers' as const },
  { email: 'child2@test.com',   name: 'Junior Scholar',  role: 'child'      as const, ageGroup: 'junior-scholars'  as const },
  { email: 'child3@test.com',   name: 'Young Disciple',  role: 'child'      as const, ageGroup: 'young-disciples'  as const },
]

async function seedTestUsers() {
  console.log('Seeding test users...\n')

  const sql = postgres(DATABASE_URL)
  const db = drizzle(sql)

  const hash = await bcrypt.hash(TEST_PASSWORD, 12)

  for (const u of testUsers) {
    const existing = await db.select().from(users).where(eq(users.email, u.email))

    if (existing.length > 0) {
      console.log(`  [skip] ${u.email} (${u.role}) already exists`)
      continue
    }

    await db.insert(users).values({
      email: u.email,
      name: u.name,
      passwordHash: hash,
      role: u.role,
      ageGroup: u.ageGroup,
    })

    console.log(`  ✓ ${u.email} — ${u.role}${u.ageGroup ? ` (${u.ageGroup})` : ''}`)
  }

  console.log(`\nAll test users use password: ${TEST_PASSWORD}`)
  await sql.end()
  process.exit(0)
}

seedTestUsers().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
