import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { 
  getUserSubscription,
  getUserSubscriptions,
  createSubscription,
  updateSubscription
} from '@/lib/subscription';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // If userId is provided and user is admin, allow access
    if (userId && session.user?.isAdmin) {
      const result = await getUserSubscriptions(parseInt(userId));
      if (result.success) {
        return NextResponse.json({ success: true, subscriptions: result.subscriptions });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }
    }

    // For regular users, get their own subscriptions
    const result = await getUserSubscriptions(parseInt(session.user.id));
    if (result.success) {
      return NextResponse.json({ success: true, subscriptions: result.subscriptions });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Only admin can create subscriptions for other users
    if (!session.user?.isAdmin && body.user_id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to create subscription for this user' },
        { status: 401 }
      );
    }

    const subscriptionData = {
      user_id: parseInt(session.user.id),
      plan_id: body.plan_id,
      status: 'active',
      current_period_start: new Date(),
      // Set next period based on plan interval
      current_period_end: new Date(Date.now() + (body.interval_count || 1) * (body.interval_type === 'year' ? 365 : body.interval_type === 'month' ? 30 : body.interval_type === 'week' ? 7 : 1) * 24 * 60 * 60 * 1000),
      cancel_at_period_end: false, // Default to false when creating subscription
    };

    const result = await createSubscription(subscriptionData);
    if (result.success) {
      return NextResponse.json({ success: true, subscription: result.subscription });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const subscriptionId = body.id;

    // Check if the user owns this subscription or is an admin
    const userSubscriptionResult = await getUserSubscription(parseInt(session.user.id));
    if (!userSubscriptionResult.success || userSubscriptionResult.subscription?.id !== subscriptionId) {
      // If not the owner, check if admin
      if (!session.user?.isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized to update this subscription' },
          { status: 401 }
        );
      }
    }

    // Allow specific updates like canceling
    const result = await updateSubscription(subscriptionId, body.updates);
    if (result.success) {
      return NextResponse.json({ success: true, subscription: result.subscription });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}