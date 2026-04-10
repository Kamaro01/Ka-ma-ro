'use client';
import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { ProductReview } from '@/types/models';
import { reviewService } from '@/services/reviewService';

interface ReviewListProps {
  reviews: ProductReview[];
  onReviewUpdated: () => void;
  userReviewId?: string;
}

export default function ReviewList({ reviews, onReviewUpdated, userReviewId }: ReviewListProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set());

  // Sort reviews
  const sortedReviews = [...(reviews || [])].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();
    } else if (sortBy === 'helpful') {
      return (b?.helpfulCount || 0) - (a?.helpfulCount || 0);
    } else if (sortBy === 'rating') {
      return (b?.rating || 0) - (a?.rating || 0);
    }
    return 0;
  });

  // Filter reviews by rating
  const filteredReviews = sortedReviews.filter(
    (review) => filterRating === 'all' || review?.rating === filterRating
  );

  const toggleExpanded = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handleHelpfulClick = async (reviewId: string) => {
    try {
      if (helpfulVotes.has(reviewId)) {
        await reviewService.unmarkHelpful(reviewId);
        setHelpfulVotes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(reviewId);
          return newSet;
        });
      } else {
        await reviewService.markHelpful(reviewId);
        setHelpfulVotes((prev) => new Set(prev).add(reviewId));
      }
      onReviewUpdated();
    } catch (err) {
      console.error('Failed to update helpful vote:', err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      onReviewUpdated();
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert('Failed to delete review');
    }
  };

  if (!reviews || reviews.length === 0) {
    return (
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
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h3>
        <p className="mt-1 text-gray-500">Be the first to review this product</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Rating Filter */}
        <div className="flex-1">
          <label htmlFor="filterRating" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Rating
          </label>
          <select
            id="filterRating"
            value={filterRating}
            onChange={(e) =>
              setFilterRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} {rating === 1 ? 'Star' : 'Stars'}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex-1">
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-6">
        {filteredReviews.map((review) => {
          const isExpanded = expandedReviews.has(review?.id || '');
          const isLongReview = (review?.reviewText?.length || 0) > 300;
          const displayText =
            isExpanded || !isLongReview
              ? review?.reviewText
              : `${review?.reviewText?.substring(0, 300)}...`;

          return (
            <div
              key={review?.id}
              className={`border-b border-gray-200 pb-6 last:border-b-0 ${
                review?.id === userReviewId ? 'bg-blue-50 -mx-4 px-4 py-4 rounded-lg' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
                      {review?.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {review?.user?.fullName || 'Anonymous'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{new Date(review?.createdAt || '').toLocaleDateString()}</span>
                        {review?.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <RatingStars rating={review?.rating || 0} size="small" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{review?.title}</h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{displayText}</p>
                  {isLongReview && (
                    <button
                      onClick={() => toggleExpanded(review?.id || '')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                    >
                      {isExpanded ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </div>

                {review?.id === userReviewId && (
                  <button
                    onClick={() => handleDeleteReview(review?.id || '')}
                    className="ml-4 text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Helpful Button */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => handleHelpfulClick(review?.id || '')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    helpfulVotes.has(review?.id || '')
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-sm font-medium">Helpful ({review?.helpfulCount || 0})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No reviews found with the selected filter
        </div>
      )}
    </div>
  );
}
