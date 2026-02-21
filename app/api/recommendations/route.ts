import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    let recommendations: any[] = [];

    if (productId) {
      // Get the current product's category
      const products = await sql`SELECT category_id FROM products WHERE id = ${parseInt(productId)} LIMIT 1`;

      if (products.length > 0 && products[0].category_id) {
        // Fetch products in the same category, excluding current product
        recommendations = await sql`
          SELECT * FROM products
          WHERE category_id = ${products[0].category_id} AND id != ${parseInt(productId)}
          LIMIT 6`;
      }
    }

    // Fallback: if no recommendations, fetch generic products
    if (recommendations.length === 0) {
      recommendations = await sql`
        SELECT * FROM products
        ${productId ? sql`WHERE id != ${parseInt(productId)}` : sql``}
        LIMIT 6`;
    }

    const formatted = recommendations.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      rating: p.rating || 0,
      reviews_count: p.reviews_count || 0,
      main_image: p.image_url || '/placeholder.svg'
    }));

    return NextResponse.json({ recommendations: formatted });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
