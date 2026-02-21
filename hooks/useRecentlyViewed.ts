'use client';

import { useEffect } from 'react';

export function useRecentlyViewed(productId: number, userId?: number) {
  useEffect(() => {
    if (!productId) return;

    // Track in localStorage for all users
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const updated = [productId, ...recent.filter((id: number) => id !== productId)].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));

    // Track in database for logged users
    if (userId) {
      fetch('/api/recently-viewed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId })
      }).catch(console.error);
    }
  }, [productId, userId]);
}