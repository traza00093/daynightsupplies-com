import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess } from '@/lib/admin-auth';
import { getCarriers, deleteCarrier, getSettings } from '@/lib/db';
import { sql } from '@/lib/db-pool';

export async function GET(request: NextRequest) {
  try {
    // Check if simple shipping is enabled
    const settingsResult = await getSettings();
    if (settingsResult.success && settingsResult.settings?.simple_shipping_enabled === 'true') {
      return NextResponse.json({
        carriers: [{
          id: 'simple-shipping',
          name: 'Free Shipping',
          code: 'simple',
          service_name: settingsResult.settings.simple_shipping_text || 'Free shipping, normally shipped within 3-5 days',
          base_delivery_days: 5,
          active: true,
          test_mode: false
        }]
      });
    }

    const result = await getCarriers();

    if (result.success) {
      return NextResponse.json({ carriers: result.carriers });
    } else {
      return NextResponse.json({ error: 'Failed to get carriers' }, { status: 500 });
    }
  } catch (error) {
    console.error('Carriers error:', error);
    return NextResponse.json({ error: 'Failed to get carriers' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { carrierId, config } = body;

    if (!carrierId) {
      return NextResponse.json({ error: 'Carrier ID required' }, { status: 400 });
    }

    // Build SET clause from config
    await sql`UPDATE carriers SET name = COALESCE(${config?.name ?? null}, name), code = COALESCE(${config?.code ?? null}, code), updated_at = NOW() WHERE id = ${parseInt(carrierId)}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update carrier error:', error);
    return NextResponse.json({ error: 'Failed to update carrier' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { name, code, service_name, base_delivery_days } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO carriers (name, code, tracking_url_template, is_active, created_at)
      VALUES (${name}, ${code}, ${null}, ${true}, NOW())
      RETURNING *`;

    return NextResponse.json({
      success: true,
      carrier: rows[0]
    });
  } catch (error) {
    console.error('Create carrier error:', error);
    return NextResponse.json({ error: 'Failed to create carrier' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Carrier ID required' }, { status: 400 });
    }

    const result = await deleteCarrier(id);
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to delete carrier' }, { status: 500 });
    }
  } catch (error) {
    console.error('Delete carrier error:', error);
    return NextResponse.json({ error: 'Failed to delete carrier' }, { status: 500 });
  }
}
