import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db-pool';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const carrierId = parseInt(params.id);
    const body = await request.json();
    const { name, service_name, base_delivery_days } = body;

    if (!name || !service_name || !base_delivery_days) {
      return NextResponse.json(
        { error: 'Name, service_name, and base_delivery_days are required' },
        { status: 400 }
      );
    }

    const rows = await sql`
      UPDATE carriers SET name = ${name}, service_name = ${service_name}, base_delivery_days = ${parseInt(base_delivery_days)}, updated_at = NOW()
      WHERE id = ${carrierId}
      RETURNING *`;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Carrier not found' }, { status: 404 });
    }

    return NextResponse.json({ carrier: rows[0] });
  } catch (error: any) {
    console.error('Error updating carrier:', error);
    return NextResponse.json({ error: 'Failed to update carrier' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const carrierId = parseInt(params.id);

    const rows = await sql`DELETE FROM carriers WHERE id = ${carrierId} RETURNING id`;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Carrier not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting carrier:', error);
    return NextResponse.json({ error: 'Failed to delete carrier' }, { status: 500 });
  }
}
