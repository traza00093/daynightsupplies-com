import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createTables, seedData } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db-init'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    await ensureDatabaseInitialized()
    const result = await getProducts(limit, 0, categoryId || undefined)
    if (result.success) {
      return NextResponse.json({ success: true, products: result.products })
    } else {
      return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 })
  }
}

export async function POST() {
  try {
    const tablesResult = await createTables()
    // createTables is now a no-op for Firestore, but keeping for compatibility
    if (!tablesResult.success) {
      return NextResponse.json({ error: 'Failed to setup database' }, { status: 500 })
    }

    const seedResult = await seedData()
    if (!seedResult.success) {
      console.error('Failed to seed data:', seedResult.error)
      return NextResponse.json({ error: 'Failed to seed database', details: seedResult.error }, { status: 500 })
    }

    return NextResponse.json({ message: 'Database initialized successfully' })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({ error: 'Failed to initialize database', details: String(error) }, { status: 500 })
  }
}
