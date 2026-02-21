import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db-pool';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const search = request.nextUrl.searchParams.get('search') || '';
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let users;
    let countResult;

    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      users = await sql`
        SELECT id, email, first_name, last_name, phone, is_active, email_verified, account_locked, account_type, created_at
        FROM users
        WHERE LOWER(email) LIKE ${searchPattern} OR LOWER(first_name) LIKE ${searchPattern} OR LOWER(last_name) LIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}`;
      countResult = await sql`
        SELECT COUNT(*) as count FROM users
        WHERE LOWER(email) LIKE ${searchPattern} OR LOWER(first_name) LIKE ${searchPattern} OR LOWER(last_name) LIKE ${searchPattern}`;
    } else {
      users = await sql`
        SELECT id, email, first_name, last_name, phone, is_active, email_verified, account_locked, account_type, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}`;
      countResult = await sql`SELECT COUNT(*) as count FROM users`;
    }

    const totalCount = parseInt(countResult[0]?.count || '0');
    const totalPages = Math.ceil(totalCount / limit);

    return Response.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return Response.json({ error: 'User ID and updates are required' }, { status: 400 });
    }

    const validFields = ['first_name', 'last_name', 'phone', 'is_active', 'email_verified', 'account_locked', 'account_type'];
    const updateData: any = {};

    for (const field of validFields) {
      if (field in updates) {
        updateData[field] = updates[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Build dynamic update query
    const setClauses = Object.keys(updateData).map(key => `${key} = '${updateData[key]}'`);

    await sql`UPDATE users SET first_name = COALESCE(${updateData.first_name ?? null}, first_name), last_name = COALESCE(${updateData.last_name ?? null}, last_name), phone = COALESCE(${updateData.phone ?? null}, phone), is_active = COALESCE(${updateData.is_active ?? null}, is_active), email_verified = COALESCE(${updateData.email_verified ?? null}, email_verified), account_locked = COALESCE(${updateData.account_locked ?? null}, account_locked), account_type = COALESCE(${updateData.account_type ?? null}, account_type), updated_at = NOW() WHERE id = ${parseInt(userId)}`;

    return Response.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
