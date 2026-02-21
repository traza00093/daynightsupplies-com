import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSettings } from '@/lib/db';
import { sql } from '@/lib/db-pool';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { settings } = await getSettings();
    const threshold = parseInt(settings?.inventory_low_stock_threshold || '10');

    const rows = await sql`
      SELECT id, name as product_name, sku, stock_quantity as current_stock
      FROM products
      WHERE stock_quantity <= ${threshold}
      ORDER BY stock_quantity ASC`;

    const alerts = rows.map((row: any) => ({
      id: row.id,
      product_name: row.product_name,
      sku: row.sku,
      current_stock: row.current_stock,
      threshold,
      status: row.current_stock <= 0 ? 'out' : 'low'
    }));

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory alerts' }, { status: 500 });
  }
}
