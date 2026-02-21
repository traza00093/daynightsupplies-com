import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db-pool';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tables = ['products', 'categories', 'orders', 'users', 'coupons', 'settings', 'security_logs'];

    const backup: any = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      collections: {}
    };

    // Fetch each table individually (Neon tagged templates don't support dynamic table names)
    try { backup.collections.products = await sql`SELECT * FROM products`; } catch (e) { backup.collections.products = []; }
    try { backup.collections.categories = await sql`SELECT * FROM categories`; } catch (e) { backup.collections.categories = []; }
    try { backup.collections.orders = await sql`SELECT * FROM orders`; } catch (e) { backup.collections.orders = []; }
    try { backup.collections.users = await sql`SELECT * FROM users`; } catch (e) { backup.collections.users = []; }
    try { backup.collections.coupons = await sql`SELECT * FROM coupons`; } catch (e) { backup.collections.coupons = []; }
    try { backup.collections.settings = await sql`SELECT * FROM settings`; } catch (e) { backup.collections.settings = []; }
    try { backup.collections.security_logs = await sql`SELECT * FROM security_logs`; } catch (e) { backup.collections.security_logs = []; }

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = Buffer.from(jsonString).toString('base64');

    const filename = `store-backup-${new Date().toISOString().split('T')[0]}.json`;

    return NextResponse.json({
      success: true,
      message: 'Backup created successfully',
      filename,
      downloadUrl: `data:application/json;base64,${blob}`,
      size: jsonString.length,
      collectionsCount: Object.keys(backup.collections).length,
      timestamp: backup.timestamp
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
