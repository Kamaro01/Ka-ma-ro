'use client';
import React from 'react';
import { ReviewStats as ReviewStatsType } from '@/types/models';
import RatingStars from './RatingStars';

interface ReviewStatsProps {
  stats: ReviewStatsType;
}

export default function ReviewStats({ stats }: ReviewStatsProps) {
  const maxCount = Math.max(...Object.values(stats?.ratingDistribution || {}), 1);

  return (
    <div className="border-b border-gray-200 pb-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {stats?.averageRating?.toFixed(1) || '0.0'}
          </div>
          <RatingStars rating={stats?.averageRating || 0} size="large" />
          <p className="text-gray-600 mt-2">
            Based on {stats?.totalReviews || 0} {stats?.totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count =
              stats?.ratingDistribution?.[rating as keyof typeof stats.ratingDistribution] || 0;
            const percentage = stats?.totalReviews ? (count / stats.totalReviews) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
