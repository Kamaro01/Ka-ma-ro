'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface SortControlsProps {
  sortBy: string;
  onSortChange: (sortOption: string) => void;
}

const SortControls: React.FC<SortControlsProps> = ({ sortBy, onSortChange }) => {
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest Arrivals' },
  ];

  return (
    <div className="relative">
      <label htmlFor="sort-select" className="sr-only">
        Sort products by
      </label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-full md:w-64 h-11 pl-4 pr-10 bg-white border border-gray-200 rounded-md text-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
        aria-label="Sort products"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="ChevronDownIcon"
        size={20}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
};

export default SortControls;
