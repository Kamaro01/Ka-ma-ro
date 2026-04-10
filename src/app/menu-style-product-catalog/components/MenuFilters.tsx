'use client';

import React from 'react';
import {
  FunnelIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';

interface FilterOptions {
  priceRange: [number, number];
  stockStatus: ('in_stock' | 'low_stock' | 'out_of_stock')[];
  sortBy: 'name' | 'price_low' | 'price_high' | 'rating';
}

interface MenuFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export default function MenuFilters({ filters, onFiltersChange }: MenuFiltersProps) {
  const handlePriceRangeChange = (index: 0 | 1, value: string) => {
    const newRange: [number, number] = [...filters.priceRange];
    newRange[index] = parseInt(value) || 0;
    onFiltersChange({ ...filters, priceRange: newRange });
  };

  const handleStockStatusToggle = (status: 'in_stock' | 'low_stock' | 'out_of_stock') => {
    const newStatuses = filters.stockStatus.includes(status)
      ? filters.stockStatus.filter((s) => s !== status)
      : [...filters.stockStatus, status];

    if (newStatuses.length > 0) {
      onFiltersChange({ ...filters, stockStatus: newStatuses });
    }
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const resetFilters = () => {
    onFiltersChange({
      priceRange: [0, 1000000],
      stockStatus: ['in_stock', 'low_stock'],
      sortBy: 'name',
    });
  };

  return (
    <div className="bg-card rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Filters</h3>
        </div>
        <button
          onClick={resetFilters}
          className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          <XMarkIcon className="h-4 w-4" />
          Reset
        </button>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="h-5 w-5 text-muted-foreground" />
          <label className="font-medium text-sm">Price Range (FRW)</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.priceRange[0]}
            onChange={(e) => handlePriceRangeChange(0, e.target.value)}
            placeholder="Min"
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="number"
            value={filters.priceRange[1]}
            onChange={(e) => handlePriceRangeChange(1, e.target.value)}
            placeholder="Max"
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      {/* Stock Status */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckBadgeIcon className="h-5 w-5 text-muted-foreground" />
          <label className="font-medium text-sm">Stock Status</label>
        </div>
        <div className="space-y-2">
          {[
            { value: 'in_stock' as const, label: 'In Stock', color: 'text-green-600' },
            { value: 'low_stock' as const, label: 'Low Stock', color: 'text-orange-600' },
            { value: 'out_of_stock' as const, label: 'Out of Stock', color: 'text-red-600' },
          ].map(({ value, label, color }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.stockStatus.includes(value)}
                onChange={() => handleStockStatusToggle(value)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
              />
              <span
                className={`text-sm ${filters.stockStatus.includes(value) ? color : 'text-muted-foreground'}`}
              >
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowsUpDownIcon className="h-5 w-5 text-muted-foreground" />
          <label className="font-medium text-sm">Sort By</label>
        </div>
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value as FilterOptions['sortBy'])}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
        >
          <option value="name">Name (A-Z)</option>
          <option value="price_low">Price (Low to High)</option>
          <option value="price_high">Price (High to Low)</option>
          <option value="rating">Customer Rating</option>
        </select>
      </div>
    </div>
  );
}
