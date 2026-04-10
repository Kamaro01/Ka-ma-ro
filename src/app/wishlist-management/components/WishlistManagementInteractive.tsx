'use client';

import { useState, useEffect } from 'react';
import { wishlistService } from '@/services/wishlistService';
import {
  WishlistItemWithProduct,
  WishlistCategory,
  WishlistStats as WishlistStatsType,
} from '@/types/models';
import { supabase } from '@/lib/supabase/client';
import WishlistGrid from './WishlistGrid';
import WishlistFilters from './WishlistFilters';
import WishlistStats from './WishlistStats';
import CategoryManager from './CategoryManager';
import AppHeader from '@/components/common/AppHeader';

export default function WishlistManagementInteractive() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithProduct[]>([]);
  const [categories, setCategories] = useState<WishlistCategory[]>([]);
  const [stats, setStats] = useState<WishlistStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'priority'>('date');
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      loadWishlistData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    } catch (err) {
      setError('Failed to load user data');
    }
  };

  const loadWishlistData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError('');

      const [itemsData, categoriesData, statsData] = await Promise.all([
        wishlistService.getWishlistItems(userId),
        wishlistService.getCategories(userId),
        wishlistService.getWishlistStats(userId),
      ]);

      setWishlistItems(itemsData || []);
      setCategories(categoriesData || []);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!userId) return;

    try {
      await wishlistService.removeFromWishlist(itemId, userId);
      setWishlistItems((prev) => prev?.filter((item) => item.id !== itemId) || []);

      // Reload stats
      const statsData = await wishlistService.getWishlistStats(userId);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    }
  };

  const handleMoveToCart = async (itemId: string) => {
    if (!userId) return;

    try {
      await wishlistService.moveToCart(itemId, userId);
      setWishlistItems((prev) => prev?.filter((item) => item.id !== itemId) || []);

      // Reload stats
      const statsData = await wishlistService.getWishlistStats(userId);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move to cart');
    }
  };

  const handleUpdatePriority = async (itemId: string, priority: number) => {
    if (!userId) return;

    try {
      await wishlistService.updateWishlistItem(itemId, userId, { priority });
      setWishlistItems(
        (prev) => prev?.map((item) => (item.id === itemId ? { ...item, priority } : item)) || []
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update priority');
    }
  };

  const handleSetPriceAlert = async (itemId: string, targetPrice: number) => {
    try {
      await wishlistService.createPriceAlert(itemId, targetPrice);
      await loadWishlistData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set price alert');
    }
  };

  const filteredAndSortedItems = () => {
    let filtered = wishlistItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered =
        filtered?.filter((item) => item.categories?.some((cat) => cat.id === selectedCategory)) ||
        [];
    }

    // Sort items
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'price':
          return (b.product?.price || 0) - (a.product?.price || 0);
        case 'priority':
          return b.priority - a.priority;
        default:
          return 0;
      }
    });

    return sorted;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            Save your favorite products for later and get notified of price drops
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Stats Section */}
        {stats && (
          <WishlistStats stats={stats} onManageCategories={() => setShowCategoryManager(true)} />
        )}

        {/* Filters Section */}
        <WishlistFilters
          categories={categories}
          selectedCategory={selectedCategory}
          sortBy={sortBy}
          onCategoryChange={setSelectedCategory}
          onSortChange={setSortBy}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && wishlistItems.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No wishlist items</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start adding products to your wishlist to see them here.
            </p>
          </div>
        )}

        {/* Wishlist Grid */}
        {!loading && wishlistItems.length > 0 && (
          <WishlistGrid
            items={filteredAndSortedItems()}
            onRemove={handleRemoveItem}
            onMoveToCart={handleMoveToCart}
            onUpdatePriority={handleUpdatePriority}
            onSetPriceAlert={handleSetPriceAlert}
          />
        )}

        {/* Category Manager Modal */}
        {showCategoryManager && (
          <CategoryManager
            categories={categories}
            onClose={() => setShowCategoryManager(false)}
            onUpdate={loadWishlistData}
          />
        )}
      </main>
    </div>
  );
}
