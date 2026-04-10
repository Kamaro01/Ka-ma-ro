'use client';

import React from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'phones', label: 'Phones' },
    { value: 'accessories', label: 'Accessories' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            selectedCategory === category.value
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
          }`}
          aria-pressed={selectedCategory === category.value}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
