'use client';

import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { ArrowRightIcon } from 'lucide-react';

interface CategoryCardProps {
  name: string;
  slug: string;
  image: string;
  alt: string;
  productCount: number;
  isFeatured?: boolean;
}

export default function CategoryCard({
  name,
  slug,
  image,
  alt,
  productCount,
  isFeatured = false,
}: CategoryCardProps) {
  return (
    <Link
      href={`/${slug}`}
      className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {isFeatured && (
        <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          ✨ New
        </div>
      )}
      <div className="relative h-48 overflow-hidden">
        <AppImage
          src={image}
          alt={alt}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
          {name}
        </h3>
        {productCount > 0 ? (
          <p className="text-gray-600">
            {productCount} {productCount === 1 ? 'Product' : 'Products'}
          </p>
        ) : (
          <p className="text-purple-600 font-medium">Explore Features</p>
        )}
        <div className="mt-4 flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
          <span>Explore</span>
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}
