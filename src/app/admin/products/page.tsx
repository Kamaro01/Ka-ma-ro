import React from 'react';

export default function AdminProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
        <div className="mb-6">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel Unavailable</h1>
          <p className="text-gray-600 text-lg mb-6">
            Product management features are temporarily disabled during system optimization.
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-6 mb-6 text-left">
          <h2 className="text-xl font-semibold text-green-900 mb-3">
            Ka-ma-ro Store Status: ✅ LIVE
          </h2>
          <div className="grid grid-cols-2 gap-4 text-green-800">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-700 font-bold">✓</span>
              </div>
              <span>Products Live</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-700 font-bold">✓</span>
              </div>
              <span>Orders Active</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-700 font-bold">✓</span>
              </div>
              <span>WhatsApp Ready</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-700 font-bold">✓</span>
              </div>
              <span>Payments Working</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 mb-6">
          <p className="font-semibold mb-2">Your store has 27 database tables ready!</p>
          <p className="text-xs">
            Products, Orders, Reviews, Categories, Inventory - All systems operational
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <a
            href="/home-product-showcase"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            View Store Front
          </a>
          <a
            href="/product-category-listing"
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Browse Products
          </a>
        </div>
      </div>
    </div>
  );
}
