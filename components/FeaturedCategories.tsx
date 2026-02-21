'use client'

import { Home, Heart, Gem, Watch, Circle, Crown, Gift, Sparkles, Star } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image_url?: string;
  created_at: string;
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Limit to 6 categories for display
            setCategories(data.categories.slice(0, 6));
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Mapping of category names to icons
  const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('ring')) return Circle;
    if (lowerName.includes('necklace') || lowerName.includes('pendant')) return Gem;
    if (lowerName.includes('watch') || lowerName.includes('time')) return Watch;
    if (lowerName.includes('earring')) return Star;
    if (lowerName.includes('bracelet')) return Circle;
    if (lowerName.includes('diamond') || lowerName.includes('stone')) return Sparkles;
    if (lowerName.includes('gold') || lowerName.includes('silver')) return Crown;
    if (lowerName.includes('set') || lowerName.includes('gift')) return Gift;

    // Default icon
    return Gem;
  };

  if (loading) {
    return (
      <section className="py-6 md:py-16 bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="group bg-secondary-800 rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square relative overflow-hidden bg-secondary-700 animate-pulse">
                  <div className="w-full h-full"></div>
                </div>
                <div className="p-3 md:p-4 text-center">
                  <div className="h-4 bg-secondary-700 rounded w-3/4 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-16 bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.name);
            return (
              <a
                key={category.id}
                href={`/category/${category.slug}`}
                className="group bg-secondary-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={category.image_url || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-colors" />
                </div>
                <div className="p-3 md:p-4 text-center">
                  <h3 className="font-medium text-sm md:text-base text-gray-100 group-hover:text-primary-400 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}