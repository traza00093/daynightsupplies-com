import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { sql } from '@/lib/db-pool'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const categoryId = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const inStock = searchParams.get('inStock')

    // Build dynamic SQL query with conditions
    let products;
    let countResult;

    if (query && categoryId && categoryId !== 'all') {
      const searchPattern = `%${query}%`;
      products = await sql`
        SELECT p.*, c.name as category_name FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ${parseInt(categoryId)}
          AND (LOWER(p.name) LIKE ${searchPattern} OR LOWER(p.description) LIKE ${searchPattern})
          ${minPrice ? sql`AND p.price >= ${parseFloat(minPrice)}` : sql``}
          ${maxPrice ? sql`AND p.price <= ${parseFloat(maxPrice)}` : sql``}
          ${inStock === 'true' ? sql`AND (p.in_stock = true OR p.stock_quantity > 0)` : sql``}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}`;
      countResult = await sql`
        SELECT COUNT(*) as count FROM products p
        WHERE p.category_id = ${parseInt(categoryId)}
          AND (LOWER(p.name) LIKE ${searchPattern} OR LOWER(p.description) LIKE ${searchPattern})
          ${minPrice ? sql`AND p.price >= ${parseFloat(minPrice)}` : sql``}
          ${maxPrice ? sql`AND p.price <= ${parseFloat(maxPrice)}` : sql``}
          ${inStock === 'true' ? sql`AND (p.in_stock = true OR p.stock_quantity > 0)` : sql``}`;
    } else if (query) {
      const searchPattern = `%${query}%`;
      products = await sql`
        SELECT p.*, c.name as category_name FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE (LOWER(p.name) LIKE ${searchPattern} OR LOWER(p.description) LIKE ${searchPattern})
          ${minPrice ? sql`AND p.price >= ${parseFloat(minPrice)}` : sql``}
          ${maxPrice ? sql`AND p.price <= ${parseFloat(maxPrice)}` : sql``}
          ${inStock === 'true' ? sql`AND (p.in_stock = true OR p.stock_quantity > 0)` : sql``}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}`;
      countResult = await sql`
        SELECT COUNT(*) as count FROM products p
        WHERE (LOWER(p.name) LIKE ${searchPattern} OR LOWER(p.description) LIKE ${searchPattern})
          ${minPrice ? sql`AND p.price >= ${parseFloat(minPrice)}` : sql``}
          ${maxPrice ? sql`AND p.price <= ${parseFloat(maxPrice)}` : sql``}
          ${inStock === 'true' ? sql`AND (p.in_stock = true OR p.stock_quantity > 0)` : sql``}`;
    } else if (categoryId && categoryId !== 'all') {
      products = await sql`
        SELECT p.*, c.name as category_name FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ${parseInt(categoryId)}
          ${minPrice ? sql`AND p.price >= ${parseFloat(minPrice)}` : sql``}
          ${maxPrice ? sql`AND p.price <= ${parseFloat(maxPrice)}` : sql``}
          ${inStock === 'true' ? sql`AND (p.in_stock = true OR p.stock_quantity > 0)` : sql``}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}`;
      countResult = await sql`
        SELECT COUNT(*) as count FROM products p
        WHERE p.category_id = ${parseInt(categoryId)}
          ${minPrice ? sql`AND p.price >= ${parseFloat(minPrice)}` : sql``}
          ${maxPrice ? sql`AND p.price <= ${parseFloat(maxPrice)}` : sql``}
          ${inStock === 'true' ? sql`AND (p.in_stock = true OR p.stock_quantity > 0)` : sql``}`;
    } else {
      products = await sql`
        SELECT p.*, c.name as category_name FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
          ${minPrice ? sql`AND p.price >= ${parseFloat(minPrice)}` : sql``}
          ${maxPrice ? sql`AND p.price <= ${parseFloat(maxPrice)}` : sql``}
          ${inStock === 'true' ? sql`AND (p.in_stock = true OR p.stock_quantity > 0)` : sql``}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}`;
      countResult = await sql`
        SELECT COUNT(*) as count FROM products p
        WHERE 1=1
          ${minPrice ? sql`AND p.price >= ${parseFloat(minPrice)}` : sql``}
          ${maxPrice ? sql`AND p.price <= ${parseFloat(maxPrice)}` : sql``}
          ${inStock === 'true' ? sql`AND (p.in_stock = true OR p.stock_quantity > 0)` : sql``}`;
    }

    const totalCount = parseInt(countResult[0]?.count || '0');

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    )
  }
}
