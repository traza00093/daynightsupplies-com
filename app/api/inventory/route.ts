import { sql } from '@/lib/db-pool';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'low-stock') {
      const products = await sql`
        SELECT id, name, stock_quantity, sku
        FROM products
        WHERE stock_quantity <= 5
        ORDER BY stock_quantity ASC, name ASC`;
      return NextResponse.json({ products });
    }

    const products = await sql`
      SELECT id, name, stock_quantity, sku, price, in_stock
      FROM products
      ORDER BY name ASC`;

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, stock_quantity } = await request.json();

    if (!productId || stock_quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rows = await sql`UPDATE products SET stock_quantity = ${stock_quantity}, in_stock = ${stock_quantity > 0} WHERE id = ${productId} RETURNING *`;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: rows[0] });
  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
