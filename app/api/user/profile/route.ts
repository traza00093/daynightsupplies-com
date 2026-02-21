import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db-pool'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let users;
    if (session.user.id) {
      users = await sql`SELECT * FROM users WHERE id = ${parseInt(session.user.id)} LIMIT 1`;
    } else {
      users = await sql`SELECT * FROM users WHERE email = ${session.user.email} LIMIT 1`;
    }

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zip_code: user.zip_code || '',
        created_at: user.created_at,
        isAdmin: user.account_type === 'admin'
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { first_name, last_name, phone, address, city, state, zip_code } = body;

    if (session.user.id) {
      await sql`
        UPDATE users SET first_name = ${first_name}, last_name = ${last_name}, phone = ${phone || null}, address = ${address || null}, city = ${city || null}, state = ${state || null}, zip_code = ${zip_code || null}, updated_at = NOW()
        WHERE id = ${parseInt(session.user.id)}
      `;
    } else {
      await sql`
        UPDATE users SET first_name = ${first_name}, last_name = ${last_name}, phone = ${phone || null}, address = ${address || null}, city = ${city || null}, state = ${state || null}, zip_code = ${zip_code || null}, updated_at = NOW()
        WHERE email = ${session.user.email}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
