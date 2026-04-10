'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import AdminAIAssistant from './AdminAIAssistant';

export default function AdminDashboardInteractive() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router?.push('/login');
    }
  }, [user, profile, authLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router?.push('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  const navigationItems = [
    { id: 'overview', name: 'Dashboard Overview', icon: '📊' },
    { id: 'products', name: 'Product Management', icon: '📦' },
    { id: 'orders', name: 'Order Processing', icon: '🛒' },
    { id: 'customers', name: 'Customer Management', icon: '👥' },
    { id: 'analytics', name: 'Analytics & Reports', icon: '📈' },
    { id: 'inventory', name: 'Inventory Control', icon: '📋' },
    { id: 'marketing', name: 'Marketing Tools', icon: '📢' },
    { id: 'settings', name: 'System Settings', icon: '⚙️' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">1,234</p>
                  </div>
                  <div className="text-3xl">🛒</div>
                </div>
                <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">RWF 45.2M</p>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
                <p className="text-sm text-green-600 mt-2">↑ 8% from last month</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Products</p>
                    <p className="text-2xl font-bold text-gray-900">456</p>
                  </div>
                  <div className="text-3xl">📦</div>
                </div>
                <p className="text-sm text-blue-600 mt-2">23 low stock alerts</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">8,921</p>
                  </div>
                  <div className="text-3xl">👥</div>
                </div>
                <p className="text-sm text-green-600 mt-2">↑ 15% from last month</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5]?.map((order) => (
                    <div key={order} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium text-gray-900">Order #{1000 + order}</p>
                        <p className="text-sm text-gray-600">Customer Name</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          RWF {(Math.random() * 50000 + 10000)?.toFixed(0)}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                    <span className="text-2xl mb-2">➕</span>
                    <span className="text-sm font-medium text-gray-700">Add Product</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                    <span className="text-2xl mb-2">📊</span>
                    <span className="text-sm font-medium text-gray-700">View Reports</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                    <span className="text-2xl mb-2">📧</span>
                    <span className="text-sm font-medium text-gray-700">Send Campaign</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                    <span className="text-2xl mb-2">⚙️</span>
                    <span className="text-sm font-medium text-gray-700">Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
              <Link
                href="/product-editor"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add New Product
              </Link>
            </div>
            <p className="text-gray-600">
              Manage your product catalog, update inventory, and set pricing. Click Add New Product
              to create items.
            </p>
          </div>
        );

      case 'orders':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Processing</h2>
            <p className="text-gray-600 mb-4">
              Process customer orders, update shipping status, and manage fulfillment workflows.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <h3 className="font-semibold text-yellow-800">Pending Orders</h3>
                <p className="text-3xl font-bold text-yellow-900 mt-2">23</p>
              </div>
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold text-blue-800">Processing</h3>
                <p className="text-3xl font-bold text-blue-900 mt-2">15</p>
              </div>
              <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <h3 className="font-semibold text-green-800">Completed Today</h3>
                <p className="text-3xl font-bold text-green-900 mt-2">42</p>
              </div>
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Management</h2>
            <p className="text-gray-600 mb-4">
              View customer profiles, purchase history, and manage customer relationships.
            </p>
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">Total Customers</p>
                  <p className="text-sm text-gray-600">Active users in system</p>
                </div>
                <p className="text-2xl font-bold text-indigo-600">8,921</p>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">New This Month</p>
                  <p className="text-sm text-gray-600">Recent signups</p>
                </div>
                <p className="text-2xl font-bold text-green-600">234</p>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Reports</h2>
            <p className="text-gray-600 mb-4">
              View sales analytics, customer behavior, and generate detailed reports.
            </p>
            <Link
              href="/analytics-dashboard"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 mt-4"
            >
              View Full Analytics Dashboard
            </Link>
          </div>
        );

      case 'inventory':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Inventory Control</h2>
            <p className="text-gray-600 mb-4">
              Monitor stock levels, set reorder points, and manage inventory alerts.
            </p>
            <Link
              href="/inventory-management-dashboard"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 mt-4"
            >
              View Inventory Dashboard
            </Link>
          </div>
        );

      case 'marketing':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Marketing Tools</h2>
            <p className="text-gray-600 mb-4">
              Create campaigns, manage promotions, and engage with customers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Link
                href="/email-marketing-dashboard"
                className="block p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <span className="text-3xl mb-2 block">📧</span>
                <h3 className="font-semibold text-gray-900">Email Marketing</h3>
                <p className="text-sm text-gray-600 mt-1">Send campaigns and newsletters</p>
              </Link>
              <Link
                href="/promotional-campaign-management"
                className="block p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <span className="text-3xl mb-2 block">🎯</span>
                <h3 className="font-semibold text-gray-900">Promotions</h3>
                <p className="text-sm text-gray-600 mt-1">Manage promotional campaigns</p>
              </Link>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
            <p className="text-gray-600 mb-4">
              Configure store settings, payment methods, and regional preferences.
            </p>
            <Link
              href="/rwanda-business-settings-configuration"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 mt-4"
            >
              Configure Business Settings
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <span className="text-2xl">{sidebarOpen ? '✕' : '☰'}</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Ka-ma-ro Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* AI Assistant Toggle Button */}
            <button
              onClick={() => setAssistantOpen(!assistantOpen)}
              className="relative p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              title="AI Assistant"
            >
              <span className="text-xl">🤖</span>
              {!assistantOpen && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              )}
            </button>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{profile?.fullName || 'Admin'}</p>
              <p className="text-xs text-gray-600">{profile?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 bg-white shadow-lg min-h-screen">
            <nav className="p-4 space-y-2">
              {navigationItems?.map((item) => (
                <button
                  key={item?.id}
                  onClick={() => setActiveSection(item?.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item?.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item?.icon}</span>
                  <span className="font-medium">{item?.name}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6">{renderContent()}</div>
      </div>

      {/* AI Assistant Widget */}
      <AdminAIAssistant isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
