'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews_count: number;
  main_image: string;
}

interface ProductRecommendationsProps {
  productId?: number;
  userId?: number;
  title?: string;
}

export default function ProductRecommendations({
  productId,
  userId,
  title = "Recommended for You"
}: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchRecommendations();
  }, [productId, userId]);

  const fetchRecommendations = async () => {
    try {
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId.toString());
      if (userId) params.append('userId', userId.toString());

      const response = await fetch(`/api/recommendations?${params}`);
      const data = await response.json();
      setProducts(data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold mb-6 text-secondary-50">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <div className="bg-secondary-900 border border-secondary-800 rounded-lg shadow-sm hover:shadow-md transition-shadow group h-full">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={product.main_image || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2 sm:p-4">
                <h4 className="font-medium text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2 text-secondary-50 group-hover:text-secondary-300 transition-colors">{product.name}</h4>
                <div className="flex items-center mb-1 sm:mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${star <= product.rating ? 'text-yellow-400 fill-current' : 'text-secondary-600'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-secondary-400 ml-1">({product.reviews_count})</span>
                </div>
                <p className="font-bold text-sm sm:text-base text-secondary-50">${product.price}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}