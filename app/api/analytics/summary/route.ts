import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { validateAdminAccess } from '@/lib/admin-auth';
import { sql } from '@/lib/db-pool';

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    const daysMatch = period.match(/(\d+)d/);
    const days = daysMatch ? parseInt(daysMatch[1]) : 30;

    // Summary metrics
    const summaryRows = await sql`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) as total_revenue,
        COUNT(DISTINCT user_id) as unique_customers,
        COALESCE(AVG(total_amount) FILTER (WHERE payment_status = 'paid'), 0) as avg_order_value
      FROM orders
      WHERE created_at >= CURRENT_DATE - ${days + ' days'}::interval`;

    const summary = summaryRows[0];

    // Top products
    const topProducts = await sql`
      SELECT p.id, p.name, p.image_url, COALESCE(SUM(oi.quantity), 0) as total_sold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= CURRENT_DATE - ${days + ' days'}::interval
      GROUP BY p.id, p.name, p.image_url
      HAVING SUM(oi.quantity) > 0
      ORDER BY total_sold DESC
      LIMIT 5`;

    // Top categories
    const topCategories = await sql`
      SELECT c.name, COALESCE(SUM(oi.quantity), 0) as total_sold
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= CURRENT_DATE - ${days + ' days'}::interval
      GROUP BY c.name
      ORDER BY total_sold DESC
      LIMIT 5`;

    return NextResponse.json({
      success: true,
      period,
      summary: {
        totalRevenue: parseFloat(summary.total_revenue).toFixed(2),
        totalOrders: parseInt(summary.total_orders),
        uniqueCustomers: parseInt(summary.unique_customers),
        avgOrderValue: parseFloat(summary.avg_order_value).toFixed(2)
      },
      topProducts,
      topCategories
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics summary'
    }, { status: 500 });
  }
}
