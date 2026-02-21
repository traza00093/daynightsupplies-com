import { sql } from '@/lib/db-pool';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'summary') {
      const rows = await sql`
        SELECT
          COUNT(DISTINCT o.id) as total_orders,
          SUM(o.total_amount) as total_revenue,
          COUNT(DISTINCT o.user_id) as total_customers,
          AVG(o.total_amount) as avg_order_value
        FROM orders o
        WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'`;

      return NextResponse.json({ summary: rows[0] });
    }

    if (type === 'products') {
      const products = await sql`
        SELECT
          p.id,
          p.name,
          COUNT(oi.id) as units_sold,
          SUM(oi.price * oi.quantity) as total_revenue
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        GROUP BY p.id, p.name
        ORDER BY total_revenue DESC NULLS LAST
        LIMIT 10`;

      return NextResponse.json({ products });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
