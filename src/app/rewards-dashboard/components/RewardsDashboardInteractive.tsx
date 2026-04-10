'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rewardsService } from '@/services/rewardsService';
import { RewardPoints, RewardTransaction, RewardTier, Referral } from '@/types/models';
import Link from 'next/link';

export default function RewardsDashboardInteractive() {
  const { user } = useAuth();
  const [rewardPoints, setRewardPoints] = useState<RewardPoints | null>(null);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [tiers, setTiers] = useState<RewardTier[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadRewardsData();
    }
  }, [user?.id]);

  const loadRewardsData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [pointsRes, transactionsRes, tiersRes, referralsRes] = await Promise.all([
        rewardsService.getUserRewardPoints(user.id),
        rewardsService.getUserTransactions(user.id, 10),
        rewardsService.getAllTiers(),
        rewardsService.getUserReferrals(user.id),
      ]);

      if (pointsRes.error) throw pointsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;
      if (tiersRes.error) throw tiersRes.error;
      if (referralsRes.error) throw referralsRes.error;

      setRewardPoints(pointsRes.data);
      setTransactions(transactionsRes.data || []);
      setTiers(tiersRes.data || []);
      setReferrals(referralsRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferral = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await rewardsService.createReferral(user.id);
      if (error) throw error;
      if (data) {
        setReferrals([data, ...referrals]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create referral code');
    }
  };

  const handleShareReferral = (code: string) => {
    const referralUrl = `${window.location.origin}/signup?ref=${code}`;
    navigator.clipboard.writeText(referralUrl);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return '🛒';
      case 'referral':
        return '👥';
      case 'review':
        return '⭐';
      case 'bonus':
        return '🎁';
      case 'redemption':
        return '💳';
      default:
        return '💰';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'bg-orange-100 text-orange-800';
      case 'silver':
        return 'bg-gray-100 text-gray-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'platinum':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
      default:
        return '🏆';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg mb-6">{error}</p>
          <button
            onClick={loadRewardsData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Try Again
          </button>
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
          <p className="text-gray-600 mb-6">Please sign in to view your rewards dashboard</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💎 Rewards Dashboard</h1>
          <p className="text-gray-600">
            Track your points, unlock rewards, and share your referral code
          </p>
        </div>

        {/* Points Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <p className="text-blue-100 text-sm font-medium mb-2">Your Current Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  {rewardPoints?.availablePoints?.toLocaleString() ?? 0}
                </span>
                <span className="text-2xl text-blue-100">points</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getTierColor(rewardPoints?.currentTier ?? 'bronze')}`}
                >
                  <span>{getTierBadge(rewardPoints?.currentTier ?? 'bronze')}</span>
                  <span className="capitalize">{rewardPoints?.currentTier ?? 'Bronze'} Member</span>
                </span>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-blue-100 text-sm mb-2">Lifetime Points</p>
              <p className="text-3xl font-bold">
                {rewardPoints?.lifetimePoints?.toLocaleString() ?? 0}
              </p>
              <Link
                href="/points-redemption-interface"
                className="inline-block mt-4 bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg"
              >
                Redeem Points
              </Link>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {rewardPoints && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Progress to Next Tier</h2>
              <span className="text-sm text-gray-600">
                {rewardPoints?.tierProgress ?? 0} / {rewardPoints?.nextTierPoints ?? 500} points
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    ((rewardPoints?.tierProgress ?? 0) / (rewardPoints?.nextTierPoints ?? 1)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {(rewardPoints?.nextTierPoints ?? 500) - (rewardPoints?.tierProgress ?? 0)} points
              until next tier
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📊</span>
              Recent Activity
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transactions?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💤</div>
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Start earning points by making purchases and writing reviews
                  </p>
                </div>
              ) : (
                transactions?.map((transaction) => (
                  <div
                    key={transaction?.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {getTransactionIcon(transaction?.transactionType ?? 'purchase')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction?.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction?.createdAt ?? '').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-bold text-lg ${(transaction?.pointsAmount ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {(transaction?.pointsAmount ?? 0) >= 0 ? '+' : ''}
                      {transaction?.pointsAmount ?? 0}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Referral Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>👥</span>
              Referrals
            </h2>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Share your referral code and earn 100 points for each friend who signs up!
              </p>
              <button
                onClick={handleCreateReferral}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg"
              >
                Generate New Code
              </button>
            </div>
            <div className="space-y-3">
              {referrals?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No referral codes yet</p>
                </div>
              ) : (
                referrals?.map((referral) => (
                  <div key={referral?.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-lg text-blue-600">
                        {referral?.referralCode}
                      </span>
                      <button
                        onClick={() => handleShareReferral(referral?.referralCode ?? '')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span
                        className={`px-2 py-1 rounded ${
                          referral?.status === 'active' ||
                          referral?.status === 'first_purchase_complete'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {referral?.status ?? 'pending'}
                      </span>
                      {(referral?.pointsAwarded ?? 0) > 0 && (
                        <span className="text-green-600 font-semibold">
                          +{referral?.pointsAwarded} pts
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {shareSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">
                  ✓ Referral link copied to clipboard!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🏆</span>
            Membership Tiers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers?.map((tier) => (
              <div
                key={tier?.id}
                className={`relative p-6 rounded-xl border-2 transition-all ${
                  rewardPoints?.currentTier === tier?.tierLevel
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {rewardPoints?.currentTier === tier?.tierLevel && (
                  <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Current
                  </div>
                )}
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">{getTierBadge(tier?.tierLevel ?? 'bronze')}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{tier?.tierName}</h3>
                  <p className="text-sm text-gray-600">
                    {tier?.pointsRequired?.toLocaleString()} points
                  </p>
                </div>
                <ul className="space-y-2">
                  {tier?.benefits?.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
