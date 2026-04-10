'use client';

import React from 'react';

interface CategoryHeaderProps {
  categoryName: string;
  productCount: number;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ categoryName, productCount }) => {
  return (
    <div className="mb-6">
      <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-1">
        {categoryName}
      </h1>
      <p className="text-sm text-gray-500">
        {productCount} {productCount === 1 ? 'product' : 'products'} available
      </p>
    </div>
  );
};

export default CategoryHeader;
