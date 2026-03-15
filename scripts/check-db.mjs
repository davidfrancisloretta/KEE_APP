import postgres from 'postgres'

const sql = postgres('postgresql://sq:sq@localhost:5433/scripturequest')

const uploads = await sql`SELECT id, file_name, status, created_at FROM content_uploads ORDER BY created_at DESC LIMIT 5`
console.log('UPLOADS:', JSON.stringify(uploads, null, 2))

const lessons = await sql`SELECT id, title, status, age_group, created_at FROM lessons ORDER BY created_at DESC LIMIT 5`
console.log('LESSONS:', JSON.stringify(lessons, null, 2))

const steps = await sql`SELECT ls.id, ls.lesson_id, ls.step_order, ls.type FROM lesson_steps ls WHERE ls.lesson_id = '7058038d-2dcd-4206-b23f-e4cef9bf4a31'`
console.log('EXODUS STEPS:', JSON.stringify(steps, null, 2))

// Clean up the empty lesson and reset upload for re-test
await sql`DELETE FROM lesson_steps WHERE lesson_id = '7058038d-2dcd-4206-b23f-e4cef9bf4a31'`
await sql`DELETE FROM lessons WHERE id = '7058038d-2dcd-4206-b23f-e4cef9bf4a31'`
await sql`UPDATE content_uploads SET status = 'uploaded', extracted_content = NULL WHERE id = 'd18da837-0854-4e92-8246-885fa90e5ca5'`
console.log('Cleaned up empty lesson and reset upload status to "uploaded"')

await sql.end()
