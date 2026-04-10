'use client';

import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { formatPrice } from '@/utils/currencyConverter';

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  alt: string;
  badge?: string;
}

interface HeroCarouselProps {
  products: FeaturedProduct[];
  currencyCode: string;
}

const HeroCarousel = ({ products, currencyCode }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isHydrated, products.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (!isHydrated) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-gray-900 rounded-lg overflow-hidden">
      <div className="absolute inset-0">
        <AppImage
          src={currentProduct.image}
          alt={currentProduct.alt}
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center px-6 md:px-12 text-center">
        {currentProduct.badge && (
          <span className="inline-block px-4 py-1.5 mb-3 bg-orange-500 text-white text-sm font-semibold rounded-full">
            {currentProduct.badge}
          </span>
        )}

        <h2 className="font-heading font-bold text-2xl md:text-4xl text-white mb-3 max-w-2xl">
          {currentProduct.name}
        </h2>

        <p className="text-xl md:text-3xl text-white font-bold mb-6">
          {formatPrice(currentProduct.price, currencyCode)}
        </p>

        <button className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors">
          Shop Now
        </button>
      </div>

      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 text-gray-900 rounded-full hover:bg-white transition-colors"
        aria-label="Previous product"
      >
        <Icon name="ChevronLeftIcon" size={20} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 text-gray-900 rounded-full hover:bg-white transition-colors"
        aria-label="Next product"
      >
        <Icon name="ChevronRightIcon" size={20} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
