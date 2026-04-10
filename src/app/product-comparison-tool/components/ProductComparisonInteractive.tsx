'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import comparisonService from '@/services/comparisonService';
import AppHeader from '@/components/common/AppHeader';
import {
  XMarkIcon,
  ShoppingCartIcon,
  HeartIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  MinusIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  image_alt: string;
  category: string;
  average_rating: number;
  review_count: number;
  stock_status: string;
  current_stock: number;
  sku: string;
  specifications?: Record<string, string | number | boolean | null>;
}

interface ComparisonFeature {
  label: string;
  key: keyof Product | 'specifications';
  type: 'text' | 'price' | 'rating' | 'stock' | 'badge';
}

const COMPARISON_FEATURES: ComparisonFeature[] = [
  { label: 'Product Name', key: 'name', type: 'text' },
  { label: 'Price', key: 'price', type: 'price' },
  { label: 'Category', key: 'category', type: 'badge' },
  { label: 'Rating', key: 'average_rating', type: 'rating' },
  { label: 'Reviews', key: 'review_count', type: 'text' },
  { label: 'Stock Status', key: 'stock_status', type: 'stock' },
  { label: 'Available Quantity', key: 'current_stock', type: 'text' },
  { label: 'SKU', key: 'sku', type: 'text' },
];

export default function ProductComparisonInteractive() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadComparisonData();
  }, [searchParams]);

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);

      const sessionIdParam = searchParams?.get('session');
      const productIdsParam = searchParams?.get('products');

      if (sessionIdParam) {
        // Load existing session
        const data = await comparisonService.getFullComparisonData(sessionIdParam);
        if (data) {
          setProducts(data.products);
          setSessionId(sessionIdParam);
        } else {
          setError('Comparison session not found');
        }
      } else if (productIdsParam) {
        // Create new session
        const productIds = productIdsParam.split(',').filter(Boolean);
        if (productIds.length > 0) {
          const session = await comparisonService.createComparisonSession(productIds);
          if (session) {
            const productsData = await comparisonService.getComparisonProducts(productIds);
            setProducts(productsData);
            setSessionId(session.id);
            router.replace(`/product-comparison-tool?session=${session.id}`);
          }
        }
      } else {
        setError('No products selected for comparison');
      }
    } catch (err) {
      setError('Failed to load comparison data');
      console.error('Error loading comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (productId: string) => {
    if (!sessionId) return;

    const updatedProductIds = products.filter((p) => p.id !== productId).map((p) => p.id);

    if (updatedProductIds.length === 0) {
      router.push('/product-category-listing');
      return;
    }

    const success = await comparisonService.updateComparisonSession(sessionId, updatedProductIds);
    if (success) {
      setProducts(products.filter((p) => p.id !== productId));
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
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

  const handleShare = async () => {
    if (!sessionId) return;

    const shareUrl = `${window.location.origin}/product-comparison-tool?session=${sessionId}`;
    try {
      await navigator.share({
        title: 'Product Comparison - Ka-ma-ro',
        text: 'Check out this product comparison',
        url: shareUrl,
      });
    } catch (err) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Comparison link copied to clipboard!');
    }
  };

  const renderFeatureValue = (product: Product, feature: ComparisonFeature) => {
    const value = product[feature.key];

    switch (feature.type) {
      case 'price':
        return (
          <div className="text-2xl font-bold text-blue-600">
            RWF {typeof value === 'number' ? value.toLocaleString() : '0'}
          </div>
        );
      case 'rating':
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(typeof value === 'number' ? value : 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {typeof value === 'number' ? value.toFixed(1) : '0.0'}
            </span>
          </div>
        );
      case 'stock': {
        const stockStatus = String(value);
        const statusColors = {
          in_stock: 'bg-green-100 text-green-800',
          low_stock: 'bg-yellow-100 text-yellow-800',
          out_of_stock: 'bg-red-100 text-red-800',
        };
        return (
          <div className="flex items-center gap-2">
            {stockStatus === 'in_stock' ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-600" />
            )}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[stockStatus as keyof typeof statusColors] ||
                'bg-gray-100 text-gray-800'
              }`}
            >
              {stockStatus.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        );
      }
      case 'badge':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {String(value)}
          </span>
        );
      default:
        return <span className="text-gray-700">{String(value || 'N/A')}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'No products to compare'}
          </h2>
          <p className="text-gray-600 mb-6">
            Please select products from the catalog to start comparing.
          </p>
          <button
            onClick={() => router.push('/product-category-listing')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Comparison</h1>
            <p className="text-gray-600">
              Compare {products.length} {products.length === 1 ? 'product' : 'products'}{' '}
              side-by-side
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ShareIcon className="w-5 h-5" />
              Share
            </button>
            <button
              onClick={() => router.push('/product-category-listing')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add More
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-48">
                    Feature
                  </th>
                  {products.map((product) => (
                    <th key={product.id} className="px-6 py-4 text-center min-w-[300px]">
                      <div className="relative">
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="absolute top-0 right-0 p-1 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                          aria-label="Remove product"
                        >
                          <XMarkIcon className="w-5 h-5 text-red-600" />
                        </button>
                        <img
                          src={product.image_url || '/assets/images/no_image.png'}
                          alt={product.image_alt || product.name}
                          className="w-32 h-32 object-cover rounded-lg mx-auto mb-3"
                        />
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Add to wishlist"
                          >
                            {wishlist.has(product.id) ? (
                              <HeartIconSolid className="w-6 h-6 text-red-500" />
                            ) : (
                              <HeartIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <ShoppingCartIcon className="w-5 h-5" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {COMPARISON_FEATURES.map((feature, index) => (
                  <tr key={feature.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{feature.label}</td>
                    {products.map((product) => (
                      <td key={`${product.id}-${feature.key}`} className="px-6 py-4 text-center">
                        {renderFeatureValue(product, feature)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <button
            onClick={() => toggleSection('description')}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-xl font-semibold text-gray-900">Product Descriptions</h3>
            {expandedSections.has('description') ? (
              <MinusIcon className="w-6 h-6 text-gray-500" />
            ) : (
              <PlusIcon className="w-6 h-6 text-gray-500" />
            )}
          </button>
          {expandedSections.has('description') && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                  <p className="text-sm text-gray-600 line-clamp-4">{product.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
