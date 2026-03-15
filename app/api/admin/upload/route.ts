import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { contentUploads } from '@/server/db/schema'
import path from 'path'
import fs from 'fs'

const ADMIN_ROLES = ['super_admin', 'content_admin', 'reviewer']
const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as any)?.role as string | undefined

  if (!session?.user || !role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const ageGroup = formData.get('ageGroup') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['docx', 'pptx', 'pdf'].includes(ext ?? '')) {
      return NextResponse.json({ error: 'Only .docx, .pptx, and .pdf files are allowed' }, { status: 400 })
    }

    // Save file to disk
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }

    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
    const filePath = path.join(UPLOAD_DIR, uniqueName)
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)

    // Record in DB
    const userId = (session.user as any).id as string
    const [upload] = await db
      .insert(contentUploads)
      .values({
        uploadedBy: userId,
        fileName: file.name,
        fileType: ext!,
        fileUrl: `/uploads/${uniqueName}`,
        targetAgeGroup: ageGroup as any ?? null,
        status: 'uploaded',
      })
      .returning()

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      fileName: upload.fileName,
      status: upload.status,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
