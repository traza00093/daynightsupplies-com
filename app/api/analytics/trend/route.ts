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
    const metric = searchParams.get('metric') || 'revenue';
    const period = searchParams.get('period') || '30d';

    const daysMatch = period.match(/(\d+)d/);
    const days = daysMatch ? parseInt(daysMatch[1]) : 30;

    const trendData = await sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) as revenue,
        COUNT(DISTINCT user_id) as customers
      FROM orders
      WHERE created_at >= CURRENT_DATE - ${days + ' days'}::interval
      GROUP BY DATE(created_at)
      ORDER BY date`;

    const data = trendData.map((row: any) => ({
      date: row.date,
      orders: parseInt(row.orders),
      revenue: parseFloat(parseFloat(row.revenue).toFixed(2)),
      customers: parseInt(row.customers),
      total: metric === 'revenue' ? parseFloat(row.revenue) :
        metric === 'customers' ? parseInt(row.customers) :
          parseInt(row.orders)
    }));

    return NextResponse.json({
      success: true,
      metric,
      period,
      data
    });
  } catch (error) {
    console.error('Analytics trend error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics trends'
    }, { status: 500 });
  }
}
