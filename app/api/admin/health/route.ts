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

    // Check database connection
    let dbHealth = 'healthy';
    try {
      await sql`SELECT 1`;
    } catch (error) {
      dbHealth = 'unhealthy';
      console.error('Database health check failed:', error);
    }

    // Get basic stats
    const usersCount = await sql`SELECT COUNT(*) as count FROM users`;
    const productsCount = await sql`SELECT COUNT(*) as count FROM products`;
    const ordersCount = await sql`SELECT COUNT(*) as count FROM orders`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        api: 'healthy'
      },
      stats: {
        usersCollection: parseInt(usersCount[0]?.count) > 0 ? 'available' : 'empty',
        productsCollection: parseInt(productsCount[0]?.count) > 0 ? 'available' : 'empty',
        ordersCollection: parseInt(ordersCount[0]?.count) > 0 ? 'available' : 'empty'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
