'use client';

import { WishlistCategory } from '@/types/models';

interface WishlistFiltersProps {
  categories: WishlistCategory[];
  selectedCategory: string;
  sortBy: 'date' | 'price' | 'priority';
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: 'date' | 'price' | 'priority') => void;
}

export default function WishlistFilters({
  categories,
  selectedCategory,
  sortBy,
  onCategoryChange,
  onSortChange,
}: WishlistFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Items</option>
            {categories?.map((category) => (
              <option key={category?.id} value={category?.id}>
                {category?.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'date' | 'price' | 'priority')}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Date Added (Newest)</option>
            <option value="price">Price (High to Low)</option>
            <option value="priority">Priority (High to Low)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
