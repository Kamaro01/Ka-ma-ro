'use client';

import React from 'react';
import MenuProductCard from './MenuProductCard';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_alt: string | null;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  current_stock: number;
  average_rating: number;
  review_count: number;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
}

interface MenuCategorySectionProps {
  category: Category;
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function MenuCategorySection({
  category,
  products,
  onAddToCart,
}: MenuCategorySectionProps) {
  return (
    <section className="scroll-mt-24" id={`category-${category.id}`}>
      {/* Category Header */}
      <div className="mb-8 border-b-2 border-primary pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              {category.name}
              <ChevronRightIcon className="h-6 w-6 text-primary" />
            </h2>
            {category.description && (
              <p className="text-muted-foreground">{category.description}</p>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {products.map((product) => (
          <MenuProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
}
