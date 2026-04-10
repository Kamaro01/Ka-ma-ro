'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rewardsService } from '@/services/rewardsService';
import { RewardPoints, Redemption } from '@/types/models';
import Link from 'next/link';

interface RewardOption {
  type: 'discount' | 'free_shipping' | 'gift_card' | 'exclusive_product';
  title: string;
  description: string;
  pointsCost: number;
  discountAmount?: number;
  icon: string;
  color: string;
}

export default function PointsRedemptionInteractive() {
  const { user } = useAuth();
  const [rewardPoints, setRewardPoints] = useState<RewardPoints | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [selectedOption, setSelectedOption] = useState<RewardOption | null>(null);
  const [success, setSuccess] = useState('');

  const rewardOptions: RewardOption[] = [
    {
      type: 'discount',
      title: '5% Discount',
      description: 'Get 5% off your next purchase',
      pointsCost: 100,
      discountAmount: 5,
      icon: '💰',
      color: 'from-green-400 to-green-600',
    },
    {
      type: 'discount',
      title: '10% Discount',
      description: 'Get 10% off your next purchase',
      pointsCost: 200,
      discountAmount: 10,
      icon: '💸',
      color: 'from-blue-400 to-blue-600',
    },
    {
      type: 'discount',
      title: '15% Discount',
      description: 'Get 15% off your next purchase',
      pointsCost: 300,
      discountAmount: 15,
      icon: '🎁',
      color: 'from-purple-400 to-purple-600',
    },
    {
      type: 'free_shipping',
      title: 'Free Shipping',
      description: 'Free shipping on your next order',
      pointsCost: 150,
      icon: '🚚',
      color: 'from-orange-400 to-orange-600',
    },
    {
      type: 'gift_card',
      title: '$10 Gift Card',
      description: 'Redeem for a $10 store credit',
      pointsCost: 250,
      discountAmount: 10,
      icon: '🎫',
      color: 'from-pink-400 to-pink-600',
    },
    {
      type: 'gift_card',
      title: '$25 Gift Card',
      description: 'Redeem for a $25 store credit',
      pointsCost: 500,
      discountAmount: 25,
      icon: '💳',
      color: 'from-red-400 to-red-600',
    },
    {
      type: 'exclusive_product',
      title: 'Exclusive Access',
      description: 'Early access to new products',
      pointsCost: 400,
      icon: '⭐',
      color: 'from-yellow-400 to-yellow-600',
    },
  ];

  useEffect(() => {
    if (user?.id) {
      loadRedemptionData();
    }
  }, [user?.id]);

  const loadRedemptionData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [pointsRes, redemptionsRes] = await Promise.all([
        rewardsService.getUserRewardPoints(user.id),
        rewardsService.getUserRedemptions(user.id),
      ]);

      if (pointsRes.error) throw pointsRes.error;
      if (redemptionsRes.error) throw redemptionsRes.error;

      setRewardPoints(pointsRes.data);
      setRedemptions(redemptionsRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load redemption data');
    } finally {
      setLoading(false);
    }
  };

  const handleRedemption = async (option: RewardOption) => {
    if (!user?.id) return;
    if ((rewardPoints?.availablePoints ?? 0) < option.pointsCost) {
      setError('Insufficient points for this redemption');
      return;
    }

    try {
      setRedeeming(true);
      setSelectedOption(option);

      const { data, error } = await rewardsService.createRedemption(
        user.id,
        option.type,
        option.pointsCost,
        option.discountAmount
      );

      if (error) throw error;

      if (data) {
        setRedemptions([data, ...redemptions]);
        setRewardPoints((prev) =>
          prev
            ? {
                ...prev,
                availablePoints: (prev.availablePoints ?? 0) - option.pointsCost,
              }
            : null
        );
        setSuccess(`Successfully redeemed ${option.title}! Your code: ${data.discountCode}`);
        setSelectedOption(null);
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem points');
    } finally {
      setRedeeming(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'applied':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading redemption options...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to redeem your points</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">🎁 Redeem Points</h1>
              <p className="text-gray-600">Convert your points into valuable rewards</p>
            </div>
            <Link
              href="/rewards-dashboard"
              className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Available Points Card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-2">Available to Redeem</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  {rewardPoints?.availablePoints?.toLocaleString() ?? 0}
                </span>
                <span className="text-2xl text-purple-100">points</span>
              </div>
            </div>
            <div className="text-6xl">💎</div>
          </div>
        </div>

        {/* Redemption Options */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewardOptions?.map((option, index) => {
              const canAfford = (rewardPoints?.availablePoints ?? 0) >= option.pointsCost;
              return (
                <div
                  key={index}
                  className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-all ${
                    canAfford
                      ? 'hover:shadow-2xl hover:scale-105 cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => canAfford && handleRedemption(option)}
                >
                  <div className={`h-2 bg-gradient-to-r ${option.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">{option.icon}</div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{option.pointsCost}</div>
                        <div className="text-sm text-gray-600">points</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                    {!canAfford && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                        <p className="text-red-700 text-sm font-medium">
                          Need {option.pointsCost - (rewardPoints?.availablePoints ?? 0)} more
                          points
                        </p>
                      </div>
                    )}
                    {canAfford && (
                      <button
                        disabled={redeeming}
                        className={`w-full bg-gradient-to-r ${option.color} text-white font-semibold py-3 rounded-lg transition-all ${
                          redeeming ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                        }`}
                      >
                        {redeeming && selectedOption?.type === option.type
                          ? 'Redeeming...'
                          : 'Redeem Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Redemption History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Redemption History</h2>
          <div className="space-y-4">
            {redemptions?.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500">No redemptions yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Redeem your first reward above to get started
                </p>
              </div>
            ) : (
              redemptions?.map((redemption) => (
                <div
                  key={redemption?.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {redemption?.redemptionType === 'discount'
                          ? '💰'
                          : redemption?.redemptionType === 'free_shipping'
                            ? '🚚'
                            : redemption?.redemptionType === 'gift_card'
                              ? '🎫'
                              : '⭐'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 capitalize">
                            {redemption?.redemptionType?.replace('_', ' ')}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(redemption?.status ?? 'pending')}`}
                          >
                            {redemption?.status}
                          </span>
                        </div>
                        {redemption?.discountCode && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">Code:</span>
                            <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono text-blue-600">
                              {redemption?.discountCode}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(redemption?.createdAt ?? '').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-600 font-bold text-lg">
                      -{redemption?.pointsUsed ?? 0}
                    </div>
                    {redemption?.expiresAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Expires {new Date(redemption.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
