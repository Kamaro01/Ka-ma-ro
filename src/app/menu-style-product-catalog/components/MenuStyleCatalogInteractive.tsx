'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import MenuCategorySection from './MenuCategorySection';

import MenuFilters from './MenuFilters';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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
  category_name?: string;
  category_id?: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  featured_image: string | null;
  featured_image_alt: string | null;
}

interface FilterOptions {
  priceRange: [number, number];
  stockStatus: ('in_stock' | 'low_stock' | 'out_of_stock')[];
  sortBy: 'name' | 'price_low' | 'price_high' | 'rating';
}

export default function MenuStyleCatalogInteractive() {
  const { user } = useAuth();
  const { items: cartItems, addItem } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 1000000],
    stockStatus: ['in_stock', 'low_stock'],
    sortBy: 'name',
  });

  useEffect(() => {
    fetchCategoriesAndProducts();
  }, [filters]);

  const fetchCategoriesAndProducts = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch products with category relationships
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(
          `
          *,
          product_categories!inner (
            category_id,
            categories (
              id,
              name
            )
          )
        `
        )
        .eq('is_active', true)
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1])
        .in('stock_status', filters.stockStatus);

      if (productsError) throw productsError;

      // Sort products
      const sortedProducts = (productsData || []) as Product[];
      switch (filters.sortBy) {
        case 'price_low':
          sortedProducts.sort((a: Product, b: Product) => a.price - b.price);
          break;
        case 'price_high':
          sortedProducts.sort((a: Product, b: Product) => b.price - a.price);
          break;
        case 'rating':
          sortedProducts.sort(
            (a: Product, b: Product) => (b.average_rating || 0) - (a.average_rating || 0)
          );
          break;
        case 'name':
        default:
          sortedProducts.sort((a: Product, b: Product) => a.name.localeCompare(b.name));
      }

      // Group products by category
      const grouped: Record<string, Product[]> = {};
      sortedProducts.forEach((product: any) => {
        const categoryId = product.product_categories?.[0]?.category_id;
        const categoryName = product.product_categories?.[0]?.categories?.name;

        if (categoryId && categoryName) {
          if (!grouped[categoryId]) {
            grouped[categoryId] = [];
          }
          grouped[categoryId].push({
            ...product,
            category_id: categoryId,
            category_name: categoryName,
          });
        }
      });

      setCategories(categoriesData || []);
      setProductsByCategory(grouped);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image_url || '',
    });
  };

  const filteredProducts = (products: Product[]) => {
    if (!searchQuery) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Product Menu
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our carefully curated selection of premium products, organized for your
              convenience
            </p>
          </div>

          {/* Search and Quick Actions */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <FunnelIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              {user ? (
                <Link
                  href="/user-account-dashboard"
                  className="flex items-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}

              <Link
                href="/wishlist-management"
                className="flex items-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <HeartIcon className="h-5 w-5" />
              </Link>

              <Link
                href="/shopping-cart-management"
                className="relative flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <MenuFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>
      )}

      {/* Menu Sections */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-6">
                <div className="h-12 bg-muted animate-pulse rounded-lg w-1/3" />
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-48 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {categories.map((category) => {
              const categoryProducts = filteredProducts(productsByCategory[category.id] || []);

              if (categoryProducts.length === 0) return null;

              return (
                <MenuCategorySection
                  key={category.id}
                  category={category}
                  products={categoryProducts}
                  onAddToCart={handleAddToCart}
                />
              );
            })}

            {categories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No products found matching your criteria
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
