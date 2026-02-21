import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateReviewStatus } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Review ID and status are required' }, 
        { status: 400 }
      );
    }
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, approved, or rejected' }, 
        { status: 400 }
      );
    }
    
    const result = await updateReviewStatus(id, status);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        review: result.review 
      });
    } else {
      return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
  }
}
