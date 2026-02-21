import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { 
  getSubscriptionPlanById, 
  updateSubscriptionPlan,
  deleteSubscriptionPlan 
} from '@/lib/subscription';

// GET: Get a specific subscription plan by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin to view subscription plan details
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const planId = parseInt(params.id);
    const result = await getSubscriptionPlanById(planId);

    if (result.success) {
      return NextResponse.json({ success: true, plan: result.plan });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription plan' },
      { status: 500 }
    );
  }
}

// PUT: Update a subscription plan
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin to update subscription plans
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const planId = parseInt(params.id);
    const body = await request.json();
    
    const result = await updateSubscriptionPlan(planId, body);

    if (result.success) {
      return NextResponse.json({ success: true, plan: result.plan });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subscription plan' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a subscription plan
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin to delete subscription plans
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const planId = parseInt(params.id);
    
    // Note: We're not actually deleting the plan to preserve historical data
    // Instead, we'll deactivate it by updating its is_active field
    const result = await updateSubscriptionPlan(planId, { is_active: false });

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Subscription plan deactivated successfully' });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscription plan' },
      { status: 500 }
    );
  }
}