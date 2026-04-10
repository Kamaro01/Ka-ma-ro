'use client';

import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  alt: string;
  category: string;
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
  currencySymbol: string;
  onAddToCart: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, currencySymbol, onAddToCart }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(product.id);
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors flex flex-col h-full">
      <div className="relative w-full h-56 overflow-hidden bg-gray-50">
        <AppImage src={product.image} alt={product.alt} className="w-full h-full object-cover" />
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
            <span className="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-body font-medium text-base text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        <p className="font-semibold text-lg text-gray-900 mb-3">
          {currencySymbol}
          {product.price.toFixed(2)}
        </p>

        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAdding}
          className={`mt-auto w-full h-11 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
            product.inStock
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          aria-label={`Add ${product.name} to cart`}
        >
          {isAdding ? (
            <>
              <Icon name="CheckIcon" size={18} />
              <span>Added</span>
            </>
          ) : (
            <>
              <Icon name="ShoppingCartIcon" size={18} />
              <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
