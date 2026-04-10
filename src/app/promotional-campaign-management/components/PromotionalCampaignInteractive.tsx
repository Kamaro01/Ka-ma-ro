'use client';

import React, { useState, useEffect } from 'react';

// Types
interface Campaign {
  id: string;
  name: string;
  type: 'percentage' | 'fixed_amount' | 'bogo' | 'free_shipping';
  discount_value: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'scheduled' | 'expired' | 'draft';
  redemptions: number;
  revenue_impact: number;
  target_segment?: string;
  min_purchase?: number;
  usage_limit?: number;
}

interface PromotionCode {
  id: string;
  code: string;
  campaign_id: string;
  usage_count: number;
  usage_limit: number;
  is_active: boolean;
}

interface PerformanceMetric {
  conversion_rate: number;
  avg_order_value: number;
  customer_acquisition: number;
  roi: number;
}

export default function PromotionalCampaignInteractive() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'analytics'>('dashboard');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [promotionCodes, setPromotionCodes] = useState<PromotionCode[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric>({
    conversion_rate: 0,
    avg_order_value: 0,
    customer_acquisition: 0,
    roi: 0,
  });

  // New Campaign Form State
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'percentage' as Campaign['type'],
    discount_value: 0,
    start_date: '',
    end_date: '',
    target_segment: 'all',
    min_purchase: 0,
    usage_limit: 0,
  });

  useEffect(() => {
    loadCampaigns();
    loadPerformanceMetrics();
  }, []);

  const loadCampaigns = async () => {
    // Mock data for campaigns
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'Summer Sale 2026',
        type: 'percentage',
        discount_value: 25,
        start_date: '2026-06-01',
        end_date: '2026-06-30',
        status: 'active',
        redemptions: 245,
        revenue_impact: 3250000,
        target_segment: 'all',
        min_purchase: 50000,
        usage_limit: 1000,
      },
      {
        id: '2',
        name: 'New Customer Welcome',
        type: 'fixed_amount',
        discount_value: 10000,
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        status: 'active',
        redemptions: 567,
        revenue_impact: 1890000,
        target_segment: 'new_customers',
        min_purchase: 30000,
      },
      {
        id: '3',
        name: 'Buy One Get One - Audio',
        type: 'bogo',
        discount_value: 50,
        start_date: '2026-02-14',
        end_date: '2026-02-28',
        status: 'scheduled',
        redemptions: 0,
        revenue_impact: 0,
        target_segment: 'audio_category',
        min_purchase: 0,
        usage_limit: 500,
      },
      {
        id: '4',
        name: 'Free Shipping Weekend',
        type: 'free_shipping',
        discount_value: 0,
        start_date: '2026-01-20',
        end_date: '2026-01-22',
        status: 'scheduled',
        redemptions: 0,
        revenue_impact: 0,
        target_segment: 'all',
        min_purchase: 25000,
      },
    ];

    setCampaigns(mockCampaigns);
  };

  const loadPerformanceMetrics = () => {
    // Mock performance data
    setPerformanceMetrics({
      conversion_rate: 18.5,
      avg_order_value: 125000,
      customer_acquisition: 342,
      roi: 3.8,
    });
  };

  const handleCreateCampaign = async () => {
    const campaign: Campaign = {
      id: Date.now().toString(),
      ...newCampaign,
      status: 'draft',
      redemptions: 0,
      revenue_impact: 0,
    };

    setCampaigns([...campaigns, campaign]);
    setActiveView('dashboard');
    resetForm();
  };

  const resetForm = () => {
    setNewCampaign({
      name: '',
      type: 'percentage',
      discount_value: 0,
      start_date: '',
      end_date: '',
      target_segment: 'all',
      min_purchase: 0,
      usage_limit: 0,
    });
  };

  const generatePromotionCode = () => {
    const code = `PROMO${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return code;
  };

  const handleBulkCodeGeneration = (count: number) => {
    const newCodes: PromotionCode[] = [];
    for (let i = 0; i < count; i++) {
      newCodes.push({
        id: Date.now().toString() + i,
        code: generatePromotionCode(),
        campaign_id: selectedCampaign?.id || '',
        usage_count: 0,
        usage_limit: 1,
        is_active: true,
      });
    }
    setPromotionCodes([...promotionCodes, ...newCodes]);
  };

  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[status];
  };

  const getTypeLabel = (type: Campaign['type']) => {
    const labels = {
      percentage: 'Percentage Discount',
      fixed_amount: 'Fixed Amount',
      bogo: 'Buy One Get One',
      free_shipping: 'Free Shipping',
    };
    return labels[type];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return 'Expired';
    if (days === 0) return 'Ends today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Promotional Campaign Management</h1>
        <p className="text-gray-600">
          Create, schedule, and monitor marketing campaigns with comprehensive discount tools
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeView === 'dashboard'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveView('create')}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeView === 'create'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Create Campaign
        </button>
        <button
          onClick={() => setActiveView('analytics')}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeView === 'analytics'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-semibold">Active Campaigns</h3>
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {campaigns.filter((c) => c.status === 'active').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Running promotions</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-semibold">Total Redemptions</h3>
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {campaigns.reduce((sum, c) => sum + c.redemptions, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Codes used</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-semibold">Revenue Impact</h3>
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(campaigns.reduce((sum, c) => sum + c.revenue_impact, 0))}
              </p>
              <p className="text-sm text-gray-500 mt-1">Generated sales</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-semibold">Scheduled</h3>
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {campaigns.filter((c) => c.status === 'scheduled').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Upcoming campaigns</p>
            </div>
          </div>

          {/* Campaigns List */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">All Campaigns</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(campaign.status)}`}
                        >
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600">{getTypeLabel(campaign.type)}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">
                        {campaign.type === 'percentage'
                          ? `${campaign.discount_value}%`
                          : campaign.type === 'fixed_amount'
                            ? formatCurrency(campaign.discount_value)
                            : campaign.type === 'bogo'
                              ? 'BOGO'
                              : 'Free Shipping'}
                      </p>
                      {campaign.status === 'active' && (
                        <p className="text-sm text-orange-600 font-semibold mt-1">
                          {getTimeRemaining(campaign.end_date)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(campaign.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(campaign.end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Redemptions</p>
                      <p className="font-semibold text-gray-900">
                        {campaign.redemptions.toLocaleString()}
                        {campaign.usage_limit && ` / ${campaign.usage_limit.toLocaleString()}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Revenue Impact</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(campaign.revenue_impact)}
                      </p>
                    </div>
                  </div>

                  {campaign.target_segment && campaign.target_segment !== 'all' && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Target:{' '}
                        {campaign.target_segment.replace(/_/g, ' ').charAt(0).toUpperCase() +
                          campaign.target_segment.replace(/_/g, ' ').slice(1)}
                      </span>
                    </div>
                  )}

                  {campaign.min_purchase && campaign.min_purchase > 0 && (
                    <p className="text-sm text-gray-600 mb-4">
                      Minimum purchase: {formatCurrency(campaign.min_purchase)}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                    >
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                      Generate Codes
                    </button>
                    {campaign.status === 'active' && (
                      <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold">
                        Pause Campaign
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign View */}
      {activeView === 'create' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Campaign</h2>

            <div className="space-y-6">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Summer Sale 2026"
                />
              </div>

              {/* Campaign Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Promotion Type
                </label>
                <select
                  value={newCampaign.type}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, type: e.target.value as Campaign['type'] })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="percentage">Percentage Discount</option>
                  <option value="fixed_amount">Fixed Amount Discount</option>
                  <option value="bogo">Buy One Get One</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              {/* Discount Value */}
              {newCampaign.type !== 'free_shipping' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {newCampaign.type === 'percentage'
                      ? 'Discount Percentage'
                      : newCampaign.type === 'fixed_amount'
                        ? 'Discount Amount (RWF)'
                        : 'BOGO Discount (%)'}
                  </label>
                  <input
                    type="number"
                    value={newCampaign.discount_value}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, discount_value: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={newCampaign.type === 'percentage' ? '25' : '10000'}
                  />
                </div>
              )}

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newCampaign.start_date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newCampaign.end_date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Customer Segmentation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Segment
                </label>
                <select
                  value={newCampaign.target_segment}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, target_segment: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Customers</option>
                  <option value="new_customers">New Customers</option>
                  <option value="loyal_customers">Loyal Customers</option>
                  <option value="audio_category">Audio Equipment Buyers</option>
                  <option value="high_value">High-Value Customers</option>
                  <option value="kigali">Kigali Customers</option>
                  <option value="inactive">Inactive Customers</option>
                </select>
              </div>

              {/* Minimum Purchase */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Purchase Amount (RWF)
                </label>
                <input
                  type="number"
                  value={newCampaign.min_purchase}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, min_purchase: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave 0 for no minimum purchase requirement
                </p>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Usage Limit
                </label>
                <input
                  type="number"
                  value={newCampaign.usage_limit}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, usage_limit: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="1000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum number of times this campaign can be used
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleCreateCampaign}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Create Campaign
                </button>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Promotional Code Generator */}
          <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bulk Code Generation</h2>
            <p className="text-gray-600 mb-6">
              Generate unique promotional codes for affiliate marketing and partner campaigns
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => handleBulkCodeGeneration(10)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Generate 10 Codes
              </button>
              <button
                onClick={() => handleBulkCodeGeneration(50)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Generate 50 Codes
              </button>
              <button
                onClick={() => handleBulkCodeGeneration(100)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Generate 100 Codes
              </button>
            </div>

            {promotionCodes.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Generated Codes ({promotionCodes.length})
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {promotionCodes.map((code) => (
                      <div
                        key={code.id}
                        className="bg-white px-3 py-2 rounded border border-gray-200 text-sm font-mono"
                      >
                        {code.code}
                      </div>
                    ))}
                  </div>
                </div>
                <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                  Export to CSV
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <div className="space-y-8">
          {/* Performance Overview */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Campaign Performance Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-blue-900">Conversion Rate</h3>
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-blue-900">
                  {performanceMetrics.conversion_rate}%
                </p>
                <p className="text-sm text-blue-700 mt-2">↑ 2.3% from last month</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-green-900">Avg Order Value</h3>
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-green-900">
                  {formatCurrency(performanceMetrics.avg_order_value)}
                </p>
                <p className="text-sm text-green-700 mt-2">↑ 15% from last month</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-purple-900">New Customers</h3>
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-purple-900">
                  {performanceMetrics.customer_acquisition}
                </p>
                <p className="text-sm text-purple-700 mt-2">Via promotional campaigns</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-orange-900">ROI</h3>
                  <svg
                    className="w-8 h-8 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-orange-900">{performanceMetrics.roi}x</p>
                <p className="text-sm text-orange-700 mt-2">Return on investment</p>
              </div>
            </div>
          </div>

          {/* Campaign Comparison */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaign Comparison</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Redemptions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{campaign.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{getTypeLabel(campaign.type)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {campaign.redemptions.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(campaign.revenue_impact)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(campaign.status)}`}
                        >
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Performing Campaigns */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Performing Campaigns</h2>

            <div className="space-y-4">
              {campaigns
                .sort((a, b) => b.revenue_impact - a.revenue_impact)
                .slice(0, 3)
                .map((campaign, index) => (
                  <div
                    key={campaign.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : index === 1
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      <span className="text-2xl font-bold">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">{getTypeLabel(campaign.type)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(campaign.revenue_impact)}
                      </p>
                      <p className="text-sm text-gray-600">{campaign.redemptions} redemptions</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
