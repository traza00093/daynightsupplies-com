import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCarriers, createCarrier } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await getCarriers();
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to fetch carriers' }, { status: 500 });
    }
    return NextResponse.json({ carriers: result.carriers });
  } catch (error) {
    console.error('Error fetching carriers:', error);
    return NextResponse.json({ error: 'Failed to fetch carriers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, service_name, base_delivery_days } = body;

    if (!name || !service_name || !base_delivery_days) {
      return NextResponse.json(
        { error: 'Name, service_name, and base_delivery_days are required' }, 
        { status: 400 }
      );
    }

    const createResult = await createCarrier({ name, service_name, base_delivery_days });
    if (!createResult.success) {
      return NextResponse.json({ error: 'Failed to create carrier' }, { status: 500 });
    }
    return NextResponse.json({ carrier: createResult.carrier });
  } catch (error: any) {
    console.error('Error creating carrier:', error);
    
    // Check if it's a unique constraint violation
    if (error.code === '23505') { // PostgreSQL unique violation error code
      return NextResponse.json({ error: 'A carrier with this name and service name already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create carrier' }, { status: 500 });
  }
}