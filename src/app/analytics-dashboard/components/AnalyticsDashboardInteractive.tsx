'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import RevenueChart from './RevenueChart';
import SalesChart from './SalesChart';
import PaymentMethodChart from './PaymentMethodChart';
import ProductPopularityChart from './ProductPopularityChart';
import CustomerBehaviorStats from './CustomerBehaviorStats';
import DateRangeFilter from './DateRangeFilter';
import { analyticsService, type AnalyticsSummary } from '@/services/analyticsService';
import Icon from '@/components/ui/AppIcon';

interface DateRange {
  startDate: string;
  endDate: string;
}

export default function AnalyticsDashboardInteractive() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getAnalyticsSummary(
        dateRange.startDate,
        dateRange.endDate
      );
      setSummary(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  const handleExport = () => {
    if (!summary) return;

    const exportData = {
      dateRange,
      summary,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ka-ma-ro-analytics-${dateRange.startDate}-to-${dateRange.endDate}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-center mb-4">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">{error}</p>
          </div>
          <button
            onClick={loadAnalytics}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `${summary?.totalRevenue?.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' }) || 'RWF 0'}`,
      change: summary?.revenueGrowth || 0,
      icon: CurrencyDollarIcon,
      color: 'blue',
    },
    {
      title: 'Orders',
      value: summary?.totalOrders?.toString() || '0',
      change: summary?.ordersGrowth || 0,
      icon: ShoppingCartIcon,
      color: 'green',
    },
    {
      title: 'Customers',
      value: summary?.totalCustomers?.toString() || '0',
      change: summary?.customerGrowth || 0,
      icon: UserGroupIcon,
      color: 'purple',
    },
    {
      title: 'Conversion Rate',
      value: `${summary?.conversionRate?.toFixed(1) || '0'}%`,
      change: summary?.conversionGrowth || 0,
      icon: ChartBarIcon,
      color: 'orange',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track sales performance and customer insights</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <DateRangeFilter
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={handleDateRangeChange}
              />
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            const isPositive = kpi.change >= 0;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              purple: 'bg-purple-100 text-purple-600',
              orange: 'bg-orange-100 text-orange-600',
            }[kpi.color];

            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {isPositive ? (
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4" />
                    )}
                    <span>{Math.abs(kpi.change).toFixed(1)}%</span>
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{kpi.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart startDate={dateRange.startDate} endDate={dateRange.endDate} />
          <SalesChart startDate={dateRange.startDate} endDate={dateRange.endDate} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PaymentMethodChart startDate={dateRange.startDate} endDate={dateRange.endDate} />
          <ProductPopularityChart startDate={dateRange.startDate} endDate={dateRange.endDate} />
        </div>

        {/* Customer Behavior Stats */}
        <CustomerBehaviorStats startDate={dateRange.startDate} endDate={dateRange.endDate} />
      </div>
    </div>
  );
}
