import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db-pool';
import {
  createProductReview,
  getProductReviewsByOrder
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const orderId = searchParams.get('orderId');

    if (productId) {
      const reviews = await sql`
        SELECT * FROM reviews
        WHERE product_id = ${parseInt(productId)} AND status = 'approved'
        ORDER BY created_at DESC`;

      const formattedReviews = reviews.map((r: any) => ({
        id: r.id,
        rating: r.rating || 0,
        title: r.review_title || '',
        comment: r.review_text || '',
        first_name: r.customer_name?.split(' ')[0] || 'Anonymous',
        last_name: r.customer_name?.split(' ').slice(1).join(' ') || '',
        created_at: r.created_at,
        verified_purchase: r.verified_purchase || false
      }));

      return NextResponse.json({ reviews: formattedReviews });
    }

    if (orderId) {
      const result = await getProductReviewsByOrder(orderId);
      return result.success
        ? NextResponse.json({ reviews: result.reviews })
        : NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    // For admin panel - return all reviews
    const session = await getServerSession(authOptions);
    if (session?.user?.isAdmin) {
      const allReviews = await sql`SELECT * FROM reviews ORDER BY created_at DESC`;
      return NextResponse.json({ reviews: allReviews });
    }

    return NextResponse.json({ error: 'ProductId or orderId is required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const {
      productId,
      userId,
      orderId,
      customerName,
      customerEmail,
      rating,
      reviewTitle,
      title,
      reviewText,
      comment
    } = body;

    if (!productId || !rating) {
      return NextResponse.json(
        { error: 'Product ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const isUserAdmin = session?.user?.isAdmin;
    const status: 'pending' | 'approved' | 'rejected' = isUserAdmin ? 'approved' : 'pending';

    let verifiedPurchase = false;
    if (orderId) {
      verifiedPurchase = true;
    }

    const reviewData = {
      product_id: productId,
      order_id: orderId || null,
      user_id: userId || session?.user?.id || null,
      customer_name: customerName || session?.user?.name || 'Anonymous',
      customer_email: customerEmail || session?.user?.email || '',
      rating,
      review_title: title || reviewTitle || '',
      review_text: comment || reviewText || '',
      verified_purchase: verifiedPurchase,
      status
    };

    const result = await createProductReview(reviewData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        review: result.review
      });
    } else {
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
