import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { 
  getSubscriptionPlans, 
  createSubscriptionPlan, 
  updateSubscriptionPlan, 
  getUserSubscription, 
  createSubscription 
} from '@/lib/subscription';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin to view all subscription plans
    const isAdmin = session?.user?.isAdmin;
    
    // For non-admins, return only active plans
    const { plans } = await getSubscriptionPlans(!isAdmin);
    
    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin to create subscription plans
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = await createSubscriptionPlan(body);

    if (result.success) {
      return NextResponse.json({ success: true, plan: result.plan });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription plan' },
      { status: 500 }
    );
  }
}