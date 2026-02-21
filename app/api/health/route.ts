import { NextResponse } from 'next/server'
import { sql } from '@/lib/db-pool'

export async function GET() {
  try {
    const rows = await sql`SELECT 1 as ok`
    return NextResponse.json({ ok: true, db: rows[0]?.ok === 1 })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: 'db' }, { status: 500 })
  }
}
