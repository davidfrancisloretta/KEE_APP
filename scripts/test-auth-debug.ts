import postgres from 'postgres'
import bcrypt from 'bcryptjs'

const sql = postgres('postgresql://sq:sq@localhost:5433/scripturequest')

async function main() {
  console.log('1. Testing DB connection...')
  const rows = await sql`SELECT email, role, password_hash IS NOT NULL as has_pw FROM users WHERE email = 'admin@test.com'`
  console.log('   User:', rows[0] ?? 'NOT FOUND')

  if (rows[0]?.has_pw) {
    console.log('2. Testing bcrypt...')
    const user = await sql`SELECT password_hash FROM users WHERE email = 'admin@test.com'`
    const valid = await bcrypt.compare('test1234', user[0].password_hash)
    console.log('   Password valid:', valid)
  }

  console.log('3. Testing next-auth import...')
  try {
    // Just test if the module can be loaded
    const NextAuth = await import('next-auth')
    console.log('   next-auth loaded, exports:', Object.keys(NextAuth))
  } catch (e: any) {
    console.log('   next-auth import error:', e.message)
  }

  await sql.end()
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
