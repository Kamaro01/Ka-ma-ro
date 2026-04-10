'use client';

import React, { useEffect, useState } from 'react';
import {
  UserGroupIcon,
  ClockIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { analyticsService, type CustomerBehavior } from '@/services/analyticsService';
import Icon from '@/components/ui/AppIcon';

interface CustomerBehaviorStatsProps {
  startDate: string;
  endDate: string;
}

export default function CustomerBehaviorStats({ startDate, endDate }: CustomerBehaviorStatsProps) {
  const [data, setData] = useState<CustomerBehavior | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const behaviorData = await analyticsService.getCustomerBehavior(startDate, endDate);
      setData(behaviorData);
    } catch (error) {
      console.error('Error loading customer behavior:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Behavior</h3>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: UserGroupIcon,
      label: 'Total Sessions',
      value: data?.totalSessions?.toString() || '0',
      color: 'blue',
    },
    {
      icon: ClockIcon,
      label: 'Avg. Session Duration',
      value: `${data?.averageSessionDuration?.toFixed(1) || '0'} min`,
      color: 'green',
    },
    {
      icon: ShoppingBagIcon,
      label: 'Cart Abandonment',
      value: `${data?.cartAbandonmentRate?.toFixed(1) || '0'}%`,
      color: 'red',
    },
    {
      icon: ArrowPathIcon,
      label: 'Repeat Purchase Rate',
      value: `${data?.repeatPurchaseRate?.toFixed(1) || '0'}%`,
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Customer Behavior Analytics</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">New: {data?.newCustomers || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Returning: {data?.returningCustomers || 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-start gap-4">
              <div
                className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Journey Insights */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Key Insights</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>
            •{' '}
            {data?.repeatPurchaseRate && data.repeatPurchaseRate > 20
              ? 'Strong customer loyalty'
              : 'Opportunity to improve retention'}
          </li>
          <li>
            •{' '}
            {data?.cartAbandonmentRate && data.cartAbandonmentRate < 30
              ? 'Low cart abandonment'
              : 'Consider checkout optimization'}
          </li>
          <li>
            • New customers represent{' '}
            {data?.newCustomers && data?.totalSessions
              ? ((data.newCustomers / data.totalSessions) * 100).toFixed(0)
              : '0'}
            % of total sessions
          </li>
        </ul>
      </div>
    </div>
  );
}
