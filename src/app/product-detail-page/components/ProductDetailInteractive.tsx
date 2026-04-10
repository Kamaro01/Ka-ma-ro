'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import RatingStars from './RatingStars';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import ReviewStats from './ReviewStats';
import { reviewService } from '@/services/reviewService';
import { ProductReview, ReviewStats as ReviewStatsType } from '@/types/models';

export default function ProductDetailInteractive() {
  const searchParams = useSearchParams();
  const productId = searchParams?.get('id') || '';

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStatsType>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [userReview, setUserReview] = useState<ProductReview | null>(null);

  useEffect(() => {
    if (productId) {
      loadReviews();
      checkReviewEligibility();
    }
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getByProductId(productId),
        reviewService.getReviewStats(productId),
      ]);
      setReviews(reviewsData || []);
      setReviewStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      const [eligibility, existingReview] = await Promise.all([
        reviewService.canUserReview(productId),
        reviewService.getUserReviewForProduct(productId),
      ]);
      setCanReview(eligibility?.canReview ?? false);
      setUserReview(existingReview);
    } catch (err) {
      console.error('Failed to check review eligibility:', err);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    loadReviews();
    checkReviewEligibility();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Details</h1>

          {/* Product Info - Placeholder for actual product details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Product Image</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product Name</h2>
              <p className="text-gray-600 mb-4">Product description goes here...</p>
              <div className="flex items-center gap-2 mb-4">
                <RatingStars rating={reviewStats?.averageRating || 0} size="large" />
                <span className="text-lg font-medium text-gray-900">
                  {reviewStats?.averageRating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-gray-600">
                  ({reviewStats?.totalReviews || 0}{' '}
                  {reviewStats?.totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            {canReview && !userReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Review Statistics */}
          <ReviewStats stats={reviewStats} />

          {/* Review Form Modal */}
          {showReviewForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Write Your Review</h3>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <ReviewForm
                    productId={productId}
                    onSuccess={handleReviewSubmitted}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* User's Existing Review */}
          {userReview && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-blue-900">Your Review</span>
              </div>
              <p className="text-blue-800 text-sm">
                You have already reviewed this product. You can edit or delete your review from the
                list below.
              </p>
            </div>
          )}

          {/* Reviews List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : (
            <ReviewList
              reviews={reviews}
              onReviewUpdated={loadReviews}
              userReviewId={userReview?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
