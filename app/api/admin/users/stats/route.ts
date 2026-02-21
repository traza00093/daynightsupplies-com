import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db-pool';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Overall user stats
    const overallStats = await sql`
      SELECT
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE is_active = true) as active_users,
        COUNT(*) FILTER (WHERE is_active = false) as inactive_users,
        COUNT(*) FILTER (WHERE email_verified = true) as verified_users,
        COUNT(*) FILTER (WHERE account_locked = true) as locked_users
      FROM users`;

    const stats = overallStats[0];

    // Order/revenue stats
    const revenueStats = await sql`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) as total_revenue
      FROM orders`;

    const rev = revenueStats[0];
    const totalUsers = parseInt(stats.total_users) || 1;
    const totalOrders = parseInt(rev.total_orders) || 0;
    const totalRevenue = parseFloat(rev.total_revenue) || 0;

    // Account type distribution
    const typeDistribution = await sql`
      SELECT COALESCE(account_type, 'customer') as account_type, COUNT(*) as count
      FROM users GROUP BY account_type`;

    // User growth over last 30 days
    const growth = await sql`
      SELECT DATE(created_at) as date, COUNT(*) as new_users
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date`;

    // Activity (using created_at as proxy)
    const activity = await sql`
      SELECT DATE(created_at) as date, COUNT(*) as active_users
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date`;

    // Top spending users
    const topSpent = await sql`
      SELECT u.id, COALESCE(TRIM(CONCAT(u.first_name, ' ', u.last_name)), u.email) as name, u.email,
        COALESCE(SUM(o.total_amount) FILTER (WHERE o.payment_status = 'paid'), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.first_name, u.last_name, u.email
      HAVING SUM(o.total_amount) > 0
      ORDER BY total_spent DESC
      LIMIT 10`;

    return Response.json({
      overall: {
        total_users: parseInt(stats.total_users),
        active_users: parseInt(stats.active_users),
        inactive_users: parseInt(stats.inactive_users),
        locked_users: parseInt(stats.locked_users),
        suspended_users: 0,
        verified_users: parseInt(stats.verified_users),
        avg_spending: totalRevenue / totalUsers,
        avg_orders_per_user: totalOrders / totalUsers,
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        premium_users: 0,
        business_users: 0,
        vip_users: 0
      },
      growth,
      typeDistribution,
      activity,
      topSpent
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
