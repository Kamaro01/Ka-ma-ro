'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsService, type ProductPopularity } from '@/services/analyticsService';

interface ProductPopularityChartProps {
  startDate: string;
  endDate: string;
}

export default function ProductPopularityChart({
  startDate,
  endDate,
}: ProductPopularityChartProps) {
  const [data, setData] = useState<ProductPopularity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const productData = await analyticsService.getProductPopularity(startDate, endDate, 8);
      setData(productData);
    } catch (error) {
      console.error('Error loading product data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 12 }} />
          <YAxis
            dataKey="productName"
            type="category"
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'totalSold') return [value, 'Units Sold'];
              return [`RWF ${value.toLocaleString()}`, 'Revenue'];
            }}
          />
          <Legend />
          <Bar dataKey="totalSold" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Units Sold" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
