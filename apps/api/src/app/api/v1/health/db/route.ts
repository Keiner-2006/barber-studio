import { NextResponse } from 'next/server'
import { getPlatformDb } from '@/shared/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    const db = getPlatformDb()
    await db.execute(sql`select 1`)
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const pgError = error as { code?: string; message?: string; cause?: { code?: string } }
    return NextResponse.json(
      { ok: false, code: pgError.code || pgError.cause?.code || 'UNKNOWN' },
      { status: 500 }
    )
  }
}