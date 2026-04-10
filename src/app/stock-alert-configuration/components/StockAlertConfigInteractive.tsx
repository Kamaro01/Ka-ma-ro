'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService, ProductWithStats } from '@/services/inventoryService';
import { Database } from '@/types/database.types';
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

type StockAlertConfig = Database['public']['Tables']['stock_alert_configs']['Row'];
type AlertType = 'low_stock' | 'out_of_stock' | 'restock_needed';

interface AlertConfigWithProduct extends StockAlertConfig {
  product?: ProductWithStats;
}

export default function StockAlertConfigInteractive() {
  const [products, setProducts] = useState<ProductWithStats[]>([]);
  const [configs, setConfigs] = useState<AlertConfigWithProduct[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    alertType: 'low_stock' as AlertType,
    threshold: 10,
    notificationEmails: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, configsRes, alertsRes] = await Promise.all([
        inventoryService.getProductsWithStats(),
        inventoryService.getAlertConfigs(),
        inventoryService.getActiveAlerts(),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (configsRes.error) throw configsRes.error;
      if (alertsRes.error) throw alertsRes.error;

      setProducts(productsRes.data || []);

      const configsWithProducts = (configsRes.data || []).map((config) => ({
        ...config,
        product: (productsRes.data || []).find((p) => p.id === config.product_id),
      }));
      setConfigs(configsWithProducts);
      setActiveAlerts(alertsRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const emails = formData.notificationEmails
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);

      const { error } = await inventoryService.createAlertConfig({
        productId: formData.productId,
        alertType: formData.alertType,
        threshold: formData.threshold,
        notificationEmails: emails,
      });

      if (error) throw error;

      await loadData();
      setShowAddForm(false);
      setFormData({
        productId: '',
        alertType: 'low_stock',
        threshold: 10,
        notificationEmails: '',
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create alert configuration');
    }
  };

  const handleToggleConfig = async (configId: string, currentState: boolean) => {
    try {
      const { error } = await inventoryService.updateAlertConfig(configId, {
        is_enabled: !currentState,
      });

      if (error) throw error;
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update configuration');
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this alert configuration?')) return;

    try {
      const { error } = await inventoryService.deleteAlertConfig(configId);

      if (error) throw error;
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete configuration');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await inventoryService.resolveAlert(alertId);

      if (error) throw error;
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resolve alert');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading configurations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Alert Configuration</h1>
              <p className="text-gray-600">
                Customize inventory monitoring thresholds and notification preferences
              </p>
            </div>
            <Link
              href="/inventory-management-dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Active Alerts Banner */}
        {activeAlerts?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Active Alerts ({activeAlerts?.length})
                </h3>
                <div className="space-y-2">
                  {activeAlerts?.map((alert) => (
                    <div
                      key={alert?.id}
                      className="flex items-center justify-between bg-white p-3 rounded"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{alert?.message}</p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(alert?.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleResolveAlert(alert?.id)}
                        className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Resolve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Configuration */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Add Alert Configuration
          </button>

          {showAddForm && (
            <form onSubmit={handleCreateConfig} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product *
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a product...</option>
                    {products?.map((product) => (
                      <option key={product?.id} value={product?.id}>
                        {product?.name} ({product?.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Type *
                  </label>
                  <select
                    value={formData.alertType}
                    onChange={(e) =>
                      setFormData({ ...formData, alertType: e.target.value as AlertType })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="restock_needed">Restock Needed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Threshold (units) *
                  </label>
                  <input
                    type="number"
                    value={formData.threshold}
                    onChange={(e) =>
                      setFormData({ ...formData, threshold: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Emails (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.notificationEmails}
                    onChange={(e) =>
                      setFormData({ ...formData, notificationEmails: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@example.com, manager@example.com"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Configuration
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Configurations List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Alert Configurations ({configs?.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alert Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notifications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {configs?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No alert configurations yet. Add your first configuration above.
                    </td>
                  </tr>
                ) : (
                  configs?.map((config) => (
                    <tr key={config?.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {config?.product?.name}
                        </div>
                        <div className="text-xs text-gray-500">SKU: {config?.product?.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {config?.alert_type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {config?.threshold} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${
                            (config?.product?.current_stock ?? 0) <= config?.threshold
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {config?.product?.current_stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleConfig(config?.id, config?.is_enabled)}
                          className="flex items-center gap-1"
                        >
                          {config?.is_enabled ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="text-sm">
                            {config?.is_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {config?.notification_emails?.length || 0} recipients
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteConfig(config?.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
