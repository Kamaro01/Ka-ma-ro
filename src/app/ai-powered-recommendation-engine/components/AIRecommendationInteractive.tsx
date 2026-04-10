'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import aiRecommendationService from '@/services/aiRecommendationService';
import AppHeader from '@/components/common/AppHeader';
import {
  SparklesIcon,
  HeartIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Icon from '@/components/ui/AppIcon';

interface Recommendation {
  product_id: string;
  recommendation_type: string;
  reason: string;
  relevance_score: number;
  products?: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    image_alt: string;
    average_rating: number;
    review_count: number;
    category: string;
    stock_status: string;
  };
}

interface RecommendationCategory {
  title: string;
  type: string;
  icon: any;
  color: string;
}

const RECOMMENDATION_CATEGORIES: RecommendationCategory[] = [
  {
    title: 'Recommended for You',
    type: 'personalized',
    icon: SparklesIcon,
    color: 'text-purple-600',
  },
  {
    title: 'Trending Now',
    type: 'trending',
    icon: ChartBarIcon,
    color: 'text-orange-600',
  },
  {
    title: 'Similar Products',
    type: 'similar',
    icon: FunnelIcon,
    color: 'text-blue-600',
  },
  {
    title: 'Frequently Bought Together',
    type: 'complementary',
    icon: ShoppingCartIcon,
    color: 'text-green-600',
  },
];

export default function AIRecommendationInteractive() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get personalized recommendations if user is logged in
      const userRecommendations = await aiRecommendationService.getUserRecommendations('', 20);

      if (userRecommendations.length > 0) {
        setRecommendations(userRecommendations);
      } else {
        // Generate new AI recommendations
        const newRecommendations = await aiRecommendationService.generateAIRecommendations({
          limit: 20,
        });

        // Fetch product details for recommendations
        const enrichedRecommendations = await Promise.all(
          newRecommendations.map(async (rec: any) => {
            const products = await aiRecommendationService.getSimilarProducts(rec.product_id, 1);
            return {
              ...rec,
              products: products[0],
            };
          })
        );

        setRecommendations(enrichedRecommendations);
      }
    } catch (err) {
      setError('Failed to load recommendations');
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const toggleWishlist = (productId: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const handleAddToCart = (productId: string) => {
    // TODO: Implement cart functionality
    console.log('Add to cart:', productId);
  };

  const handleProductClick = (productId: string) => {
    router.push(`/product-detail-page?id=${productId}`);
  };

  const filteredRecommendations =
    selectedCategory === 'all'
      ? recommendations
      : recommendations.filter((rec) => rec.recommendation_type === selectedCategory);

  const renderRecommendationCard = (recommendation: Recommendation) => {
    const product = recommendation.products;
    if (!product) return null;

    return (
      <div
        key={recommendation.product_id}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
      >
        <div className="relative">
          <img
            src={product.image_url || '/assets/images/no_image.png'}
            alt={product.image_alt || product.name}
            className="w-full h-48 object-cover cursor-pointer"
            onClick={() => handleProductClick(product.id)}
          />
          <button
            onClick={() => toggleWishlist(product.id)}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            aria-label="Add to wishlist"
          >
            {wishlist.has(product.id) ? (
              <HeartIconSolid className="w-6 h-6 text-red-500" />
            ) : (
              <HeartIcon className="w-6 h-6 text-gray-400" />
            )}
          </button>
          {recommendation.relevance_score >= 0.8 && (
            <div className="absolute top-2 left-2 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <SparklesIcon className="w-4 h-4" />
              Top Pick
            </div>
          )}
        </div>

        <div className="p-4">
          <h3
            className="font-semibold text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-blue-600"
            onClick={() => handleProductClick(product.id)}
          >
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.average_rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.review_count})</span>
          </div>

          <div className="text-xl font-bold text-blue-600 mb-2">
            RWF {product.price.toLocaleString()}
          </div>

          <div className="bg-blue-50 rounded-lg p-2 mb-3">
            <p className="text-xs text-blue-800 line-clamp-2">
              <span className="font-semibold">Why recommended:</span> {recommendation.reason}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                product.stock_status === 'in_stock'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {product.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
            </span>
            <button
              onClick={() => handleAddToCart(product.id)}
              disabled={product.stock_status !== 'in_stock'}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <ShoppingCartIcon className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading AI recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <SparklesIcon className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Recommendations</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <SparklesIcon className="w-10 h-10 text-purple-600" />
                AI-Powered Recommendations
              </h1>
              <p className="text-gray-600">
                Personalized product suggestions just for you, powered by artificial intelligence
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Recommendations
            </button>
            {RECOMMENDATION_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.type}
                  onClick={() => setSelectedCategory(category.type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    selectedCategory === category.type
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${selectedCategory === category.type ? 'text-white' : category.color}`}
                  />
                  {category.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommendations Grid */}
        {filteredRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecommendations.map(renderRecommendationCard)}
          </div>
        ) : (
          <div className="text-center py-12">
            <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No recommendations available
            </h3>
            <p className="text-gray-600 mb-6">
              Browse products to get personalized recommendations
            </p>
            <button
              onClick={() => router.push('/product-category-listing')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
