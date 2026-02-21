'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  first_name: string;
  last_name: string;
  created_at: string;
  verified_purchase: boolean;
}

interface ProductReviewsProps {
  productId: number;
  userId?: number;
}

export default function ProductReviews({ productId, userId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userId,
          ...formData
        })
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({ rating: 5, title: '', comment: '' });
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-secondary-600'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-secondary-50">Customer Reviews ({reviews.length})</h3>
        {userId && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-500 text-secondary-50 px-4 py-2 rounded hover:bg-primary-400"
          >
            Write Review
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-secondary-800 p-4 rounded-lg mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary-300 mb-2">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-secondary-600'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-secondary-600 rounded-md bg-secondary-900 text-secondary-50"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary-300 mb-2">Review</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full px-3 py-2 border border-secondary-600 rounded-md bg-secondary-900 text-secondary-50"
              rows={4}
              required
            />
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="bg-primary-500 text-secondary-50 px-4 py-2 rounded hover:bg-primary-400">
              Submit Review
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-secondary-600 text-secondary-50 px-4 py-2 rounded hover:bg-secondary-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-secondary-700 pb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  {renderStars(review.rating)}
                  {review.verified_purchase && (
                    <span className="text-xs bg-green-900 text-green-100 border border-green-800 px-2 py-1 rounded">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-secondary-50">{review.title}</h4>
              </div>
              <div className="text-sm text-secondary-400">
                {review.first_name} {review.last_name?.charAt(0)}.
              </div>
            </div>
            <p className="text-secondary-300 mb-2">{review.comment}</p>
            <p className="text-xs text-secondary-400">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}