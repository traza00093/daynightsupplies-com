import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db-pool';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const users = await sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;

    if (users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = users[0];

    // Get user's orders
    const orders = await sql`
      SELECT * FROM orders WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 50`;

    // Get user's reviews
    const reviews = await sql`
      SELECT r.*, p.name as product_name FROM reviews r LEFT JOIN products p ON r.product_id = p.id WHERE r.user_id = ${userId} ORDER BY r.created_at DESC`;

    // Get user's wishlist
    const wishlist = await sql`
      SELECT w.*, p.name, p.price, p.image_url FROM wishlist w LEFT JOIN products p ON w.product_id = p.id WHERE w.user_id = ${userId}`;

    // Get user's activity
    const activity = await sql`
      SELECT * FROM user_activity_logs WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 50`;

    return Response.json({
      user: {
        ...userData,
        password_hash: undefined,
        verification_token: undefined,
        password_reset_token: undefined
      },
      orders,
      activity,
      addresses: [],
      reviews,
      wishlist,
      cart: []
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { updates } = body;

    if (!updates || typeof updates !== 'object') {
      return Response.json({ error: 'Updates object is required' }, { status: 400 });
    }

    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE id = ${userId}`;
    if (existing.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Whitelist of allowed fields
    const validFields = [
      'first_name', 'last_name', 'phone', 'address', 'city', 'state', 'zip_code',
      'is_active', 'email_verified', 'account_locked', 'account_type'
    ];

    const updateData: any = {};
    for (const field of validFields) {
      if (field in updates) {
        updateData[field] = updates[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await sql`UPDATE users SET
      first_name = COALESCE(${updateData.first_name ?? null}, first_name),
      last_name = COALESCE(${updateData.last_name ?? null}, last_name),
      phone = COALESCE(${updateData.phone ?? null}, phone),
      address = COALESCE(${updateData.address ?? null}, address),
      city = COALESCE(${updateData.city ?? null}, city),
      state = COALESCE(${updateData.state ?? null}, state),
      zip_code = COALESCE(${updateData.zip_code ?? null}, zip_code),
      is_active = COALESCE(${updateData.is_active ?? null}, is_active),
      email_verified = COALESCE(${updateData.email_verified ?? null}, email_verified),
      account_locked = COALESCE(${updateData.account_locked ?? null}, account_locked),
      account_type = COALESCE(${updateData.account_type ?? null}, account_type),
      updated_at = NOW()
      WHERE id = ${userId}`;

    return Response.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user details:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
