import { sql } from '@/lib/db-pool';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get('ids')

    if (!productIds) {
      return NextResponse.json(
        { success: false, error: 'Product IDs are required' },
        { status: 400 }
      )
    }

    const idArray = productIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))

    if (idArray.length === 0 || idArray.length > 4) {
      return NextResponse.json(
        { success: false, error: 'Please provide 1-4 valid product IDs' },
        { status: 400 }
      )
    }

    const products = await sql`SELECT * FROM products WHERE id = ANY(${idArray})`;

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Compare error:', error);
    return NextResponse.json({ error: 'Failed to fetch products for comparison' }, { status: 500 });
  }
}
