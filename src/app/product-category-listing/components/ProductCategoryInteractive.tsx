'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import CategoryHeader from './CategoryHeader';
import SearchBar from './SearchBar';
import SortControls from './SortControls';
import CategoryFilter from './CategoryFilter';
import ProductGrid from './ProductGrid';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  alt: string;
  category: string;
  inStock: boolean;
  featured: boolean;
  dateAdded: string;
}

const ProductCategoryInteractive: React.FC = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const { addItem } = useCart();

  useEffect(() => {
    setIsHydrated(true);
    const savedCurrency = localStorage.getItem('currencySymbol') || '$';
    setCurrencySymbol(savedCurrency);
  }, []);

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      price: 1199.99,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_169bd7559-1767283843614.png',
      alt: 'iPhone 15 Pro Max in titanium finish with triple camera system on white background',
      category: 'phones',
      inStock: true,
      featured: true,
      dateAdded: '2026-01-10',
    },
    {
      id: '2',
      name: 'iPhone 15 Pro',
      price: 999.99,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_160d91aeb-1765276750645.png',
      alt: 'iPhone 15 Pro in blue titanium with action button visible on side',
      category: 'phones',
      inStock: true,
      featured: true,
      dateAdded: '2026-01-09',
    },
    {
      id: '3',
      name: 'iPhone 15',
      price: 799.99,
      image: 'https://images.unsplash.com/photo-1706043389278-d9cc5532f330',
      alt: 'iPhone 15 in pink color showing dynamic island display feature',
      category: 'phones',
      inStock: true,
      featured: false,
      dateAdded: '2026-01-08',
    },
    {
      id: '4',
      name: 'iPhone 14 Pro',
      price: 899.99,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_11ce4ee67-1764738511529.png',
      alt: 'iPhone 14 Pro in deep purple with always-on display showing time',
      category: 'phones',
      inStock: true,
      featured: false,
      dateAdded: '2026-01-05',
    },
    {
      id: '5',
      name: 'iPhone 14',
      price: 699.99,
      image: 'https://images.unsplash.com/photo-1571137062219-e63343b18bd7',
      alt: 'iPhone 14 in midnight black showing dual camera system',
      category: 'phones',
      inStock: false,
      featured: false,
      dateAdded: '2026-01-04',
    },
    {
      id: '6',
      name: 'MagSafe Charger',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1591290619618-904f6dd935e3',
      alt: 'White circular MagSafe wireless charger with USB-C cable on marble surface',
      category: 'accessories',
      inStock: true,
      featured: true,
      dateAdded: '2026-01-12',
    },
    {
      id: '7',
      name: 'AirPods Pro (2nd Gen)',
      price: 249.99,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_10bc08a3c-1766254612533.png',
      alt: 'White AirPods Pro with charging case showing active noise cancellation feature',
      category: 'accessories',
      inStock: true,
      featured: true,
      dateAdded: '2026-01-11',
    },
    {
      id: '8',
      name: 'Silicone Case - iPhone 15',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1664363535302-6f71e41a176a',
      alt: 'Navy blue silicone iPhone case with soft-touch finish and MagSafe compatibility',
      category: 'accessories',
      inStock: true,
      featured: false,
      dateAdded: '2026-01-10',
    },
    {
      id: '9',
      name: 'Lightning to USB-C Cable',
      price: 19.99,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_106b62446-1767441725928.png',
      alt: 'White braided Lightning to USB-C cable coiled on wooden desk',
      category: 'accessories',
      inStock: true,
      featured: false,
      dateAdded: '2026-01-09',
    },
    {
      id: '10',
      name: 'Screen Protector - Tempered Glass',
      price: 29.99,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f79e50a5-1764656578000.png',
      alt: 'Clear tempered glass screen protector with installation kit on black background',
      category: 'accessories',
      inStock: true,
      featured: false,
      dateAdded: '2026-01-08',
    },
    {
      id: '11',
      name: 'Car Mount - MagSafe',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1729067427232-eb5cb974aa8e',
      alt: 'Black MagSafe car mount attached to air vent with adjustable arm',
      category: 'accessories',
      inStock: false,
      featured: false,
      dateAdded: '2026-01-07',
    },
    {
      id: '12',
      name: 'Leather Wallet - MagSafe',
      price: 59.99,
      image: 'https://images.unsplash.com/photo-1643218231118-79c835f1322f',
      alt: 'Brown leather MagSafe wallet holding credit cards attached to iPhone',
      category: 'accessories',
      inStock: true,
      featured: false,
      dateAdded: '2026-01-06',
    },
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = mockProducts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      case 'featured':
        sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        break;
    }

    return sorted;
  }, [searchQuery, sortBy, selectedCategory]);

  const handleAddToCart = (productId: string) => {
    const product = mockProducts.find((p) => p.id === productId);
    if (product && product.inStock) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      });
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-12 bg-muted rounded-md animate-pulse mb-6"></div>
          <div className="h-12 bg-muted rounded-md animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-96 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <CategoryHeader
          categoryName={
            selectedCategory === 'all'
              ? 'All Products'
              : selectedCategory === 'phones'
                ? 'Phones'
                : 'Accessories'
          }
          productCount={filteredAndSortedProducts.length}
        />

        <div className="mb-6">
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </div>

        <div className="mb-6">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <p className="caption text-muted-foreground">
            Showing {filteredAndSortedProducts.length} of {mockProducts.length} products
          </p>
          <SortControls sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        <ProductGrid
          products={filteredAndSortedProducts}
          currencySymbol={currencySymbol}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
};

export default ProductCategoryInteractive;
