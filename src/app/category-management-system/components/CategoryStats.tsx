'use client';

import React from 'react';
import { Category } from '@/services/categoryService';
import {
  FolderIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface CategoryStatsProps {
  categories: Category[];
}

const CategoryStats: React.FC<CategoryStatsProps> = ({ categories }) => {
  const totalCategories = categories.length;
  const activeCategories = categories.filter((cat) => cat.is_active).length;
  const inactiveCategories = totalCategories - activeCategories;
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0);
  const topLevelCategories = categories.filter((cat) => !cat.parent_id).length;

  const stats = [
    {
      label: 'Total Categories',
      value: totalCategories,
      icon: FolderIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Active Categories',
      value: activeCategories,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Inactive Categories',
      value: inactiveCategories,
      icon: XCircleIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'Total Products',
      value: totalProducts,
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryStats;
