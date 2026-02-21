import { sql } from '@/lib/db-pool';
import { NextRequest, NextResponse } from 'next/server';

function calculateEstimatedDelivery(baseDays: number, additionalDays: number = 0): { estimatedDelivery: string, totalDays: number } {
  const totalDays = baseDays + additionalDays + 1;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + totalDays);
  const formattedDate = estimatedDate.toISOString().split('T')[0];
  return { estimatedDelivery: formattedDate, totalDays };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zipCode');
    const carrierId = searchParams.get('carrierId');
    const country = searchParams.get('country') || 'US';

    if (!zipCode || !carrierId) {
      return NextResponse.json({ error: 'Missing required parameters: zipCode and carrierId' }, { status: 400 });
    }

    const zipPrefix = zipCode.substring(0, 3);

    const rows = await sql`
      SELECT sz.base_delivery_days, sz.additional_days
      FROM shipping_zones sz
      WHERE sz.country_code = ${country}
        AND sz.zip_prefix = ${zipPrefix}
        AND sz.carrier_id = ${parseInt(carrierId)}
      ORDER BY sz.id DESC
      LIMIT 1`;

    if (rows.length === 0) {
      const { estimatedDelivery, totalDays } = calculateEstimatedDelivery(5);
      return NextResponse.json({ estimatedDelivery, totalDays, message: 'Default delivery estimate used - no specific zone found' });
    }

    const zone = rows[0];
    const { estimatedDelivery, totalDays } = calculateEstimatedDelivery(zone.base_delivery_days, zone.additional_days);

    return NextResponse.json({ estimatedDelivery, totalDays });
  } catch (error) {
    console.error('Shipping estimate error:', error);
    return NextResponse.json({ error: 'Failed to calculate shipping estimate' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zipCode, carrierId, country = 'US' } = body;

    if (!zipCode || !carrierId) {
      return NextResponse.json({ error: 'Missing required parameters: zipCode and carrierId' }, { status: 400 });
    }

    const zipPrefix = zipCode.substring(0, 3);

    const rows = await sql`
      SELECT sz.base_delivery_days, sz.additional_days
      FROM shipping_zones sz
      WHERE sz.country_code = ${country}
        AND sz.zip_prefix = ${zipPrefix}
        AND sz.carrier_id = ${parseInt(carrierId)}
      ORDER BY sz.id DESC
      LIMIT 1`;

    if (rows.length === 0) {
      const { estimatedDelivery, totalDays } = calculateEstimatedDelivery(5);
      return NextResponse.json({ estimatedDelivery, totalDays, message: 'Default delivery estimate used - no specific zone found' });
    }

    const zone = rows[0];
    const { estimatedDelivery, totalDays } = calculateEstimatedDelivery(zone.base_delivery_days, zone.additional_days);

    return NextResponse.json({ estimatedDelivery, totalDays });
  } catch (error) {
    console.error('Shipping estimate error:', error);
    return NextResponse.json({ error: 'Failed to calculate shipping estimate' }, { status: 500 });
  }
}
