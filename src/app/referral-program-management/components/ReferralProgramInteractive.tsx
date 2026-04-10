'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { referralService } from '@/services/referralService';
import { rewardsService } from '@/services/rewardsService';
import { Referral, ReferralStatus } from '@/types/models';
import AppHeader from '@/components/common/AppHeader';

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  successfulReferrals: number;
  totalPointsEarned: number;
  recentReferrals: Referral[];
}

interface RewardStats {
  totalPoints: number;
  lifetimePoints: number;
}

export default function ReferralProgramInteractive() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [rewardStats, setRewardStats] = useState<RewardStats | null>(null);
  const [friendEmail, setFriendEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'tracking' | 'leaderboard'>('share');

  useEffect(() => {
    if (user?.id) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      const [statsResult, rewardsResult] = await Promise.all([
        referralService.getReferralStats(user.id),
        rewardsService.getRewardsStats(user.id),
      ]);

      if (statsResult.error) throw statsResult.error;
      if (rewardsResult.error) throw rewardsResult.error;

      setReferralStats(statsResult.data);
      setRewardStats(
        rewardsResult.data
          ? {
              totalPoints: rewardsResult.data.totalPoints,
              lifetimePoints: rewardsResult.data.lifetimePoints,
            }
          : null
      );

      // Get or create referral code
      const userReferrals = statsResult.data?.recentReferrals || [];
      if (userReferrals.length > 0) {
        const code = userReferrals[0]?.referralCode || '';
        setReferralCode(code);
        setReferralLink(referralService.generateReferralLink(code));
      } else {
        // Create first referral to get code
        const newReferralResult = await referralService.createReferral({
          referrerId: user.id,
          refereeEmail: 'placeholder@temp.com',
        });

        if (!newReferralResult.error && newReferralResult.data) {
          const code = newReferralResult.data.referralCode;
          setReferralCode(code);
          setReferralLink(referralService.generateReferralLink(code));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      setError('Failed to copy link');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      setError('Failed to copy code');
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'instagram') => {
    const shareText = referralService.generateShareText(referralCode);
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.twitter)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        break;
      case 'instagram':
        setSuccessMessage(
          'Instagram sharing: Copy your referral code and share in your story or bio!'
        );
        setTimeout(() => setSuccessMessage(''), 3000);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleInviteFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !friendEmail) return;

    try {
      setError('');
      setSuccessMessage('');

      const result = await referralService.createReferral({
        referrerId: user.id,
        refereeEmail: friendEmail,
      });

      if (result.error) throw result.error;

      setSuccessMessage(`Invitation sent to ${friendEmail}!`);
      setFriendEmail('');
      await loadReferralData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };

  const getStatusBadge = (status: ReferralStatus) => {
    const statusConfig = {
      pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      signed_up: { text: 'Signed Up', color: 'bg-blue-100 text-blue-800' },
      first_purchase_complete: { text: 'First Purchase', color: 'bg-green-100 text-green-800' },
      active: { text: 'Active', color: 'bg-purple-100 text-purple-800' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading referral program...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Refer Friends, Earn Rewards</h1>
            <p className="text-lg mb-6 text-blue-100">
              Share Ka-ma-ro with friends and family. Earn points when they sign up and make their
              first purchase!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">{rewardStats?.totalPoints || 0}</div>
                <div className="text-sm text-blue-100">Available Points</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">
                  {referralStats?.successfulReferrals || 0}
                </div>
                <div className="text-sm text-blue-100">Successful Referrals</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">
                  {referralStats?.totalPointsEarned || 0}
                </div>
                <div className="text-sm text-blue-100">Points Earned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('share')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'share'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Share & Invite
              </button>
              <button
                onClick={() => setActiveTab('tracking')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tracking'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Track Referrals
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'leaderboard'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Share & Invite Tab */}
        {activeTab === 'share' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referral Link Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>
              <p className="text-gray-600 mb-4">Share this link with friends to earn rewards</p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    {copiedLink ? '✓ Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-lg font-mono text-center"
                  />
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    {copiedCode ? '✓ Copied' : 'Copy Code'}
                  </button>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Share on Social Media
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleSocialShare('twitter')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                    Twitter
                  </button>
                  <button
                    onClick={() => handleSocialShare('facebook')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166fe5] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                  <button
                    onClick={() => handleSocialShare('instagram')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Instagram
                  </button>
                </div>
              </div>
            </div>

            {/* Email Invitation Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Invite via Email</h2>
              <p className="text-gray-600 mb-4">Send a direct invitation to your friends</p>

              <form onSubmit={handleInviteFriend} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Friend&apos;s Email
                  </label>
                  <input
                    type="email"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    placeholder="friend@example.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Invitation
                </button>
              </form>

              {/* Reward Structure */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Reward Structure</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">When friend signs up:</span>
                    <span className="font-medium text-green-600">+100 points</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">When friend makes first purchase:</span>
                    <span className="font-medium text-green-600">+200 points</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Your friend gets:</span>
                    <span className="font-medium text-blue-600">+50 points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Track Referrals Tab */}
        {activeTab === 'tracking' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Your Referrals</h2>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {referralStats?.totalReferrals || 0}
                </div>
                <div className="text-sm text-gray-600">Total Referrals</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {referralStats?.pendingReferrals || 0}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {referralStats?.successfulReferrals || 0}
                </div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
            </div>

            {/* Referrals List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Friend
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points Earned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referralStats?.recentReferrals?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No referrals yet. Start sharing your link to earn rewards!
                      </td>
                    </tr>
                  ) : (
                    referralStats?.recentReferrals?.map((referral) => (
                      <tr key={referral?.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {referral?.refereeEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(referral?.referralStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            +{referral?.referrerPointsEarned} points
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(referral?.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Top Referrers</h2>
            <p className="text-gray-600 mb-6">See how you compare with other Ka-ma-ro members</p>

            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((rank) => (
                <div key={rank} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      rank === 1
                        ? 'bg-yellow-400 text-white'
                        : rank === 2
                          ? 'bg-gray-300 text-white'
                          : rank === 3
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Coming Soon</div>
                    <div className="text-sm text-gray-500">Leaderboard feature in development</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">---</div>
                    <div className="text-sm text-gray-500">referrals</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
