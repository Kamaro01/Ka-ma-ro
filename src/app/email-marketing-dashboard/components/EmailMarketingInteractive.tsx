'use client';

import React, { useState } from 'react';
import {
  emailService,
  ProductRecommendationEmailData,
  AbandonedCartEmailData,
  PostPurchaseEmailData,
} from '@/services/emailService';

type EmailType = 'recommendations' | 'abandoned_cart' | 'post_purchase';

export default function EmailMarketingInteractive() {
  const [activeTab, setActiveTab] = useState<EmailType>('recommendations');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Product Recommendations form state
  const [recommendationsData, setRecommendationsData] = useState<ProductRecommendationEmailData>({
    customerName: '',
    products: [{ name: '', price: 0, imageUrl: '', url: '' }],
    shopUrl: 'https://ka-ma-ro.com/shop',
    unsubscribeUrl: 'https://ka-ma-ro.com/unsubscribe',
  });

  // Abandoned Cart form state
  const [abandonedCartData, setAbandonedCartData] = useState<AbandonedCartEmailData>({
    customerName: '',
    cartItems: [{ name: '', quantity: 1, price: 0, imageUrl: '' }],
    cartTotal: 0,
    checkoutUrl: 'https://ka-ma-ro.com/checkout',
    supportUrl: 'https://ka-ma-ro.com/support',
    discountCode: '',
    discountPercent: 0,
  });

  // Post Purchase form state
  const [postPurchaseData, setPostPurchaseData] = useState<PostPurchaseEmailData>({
    customerName: '',
    orderNumber: '',
    orderDate: new Date().toLocaleDateString(),
    totalAmount: 0,
    estimatedDelivery: '',
    orderItems: [{ name: '', quantity: 1, price: 0, imageUrl: '' }],
    trackingNumber: '',
    trackingUrl: '',
    deliveryDays: 5,
    orderDetailsUrl: 'https://ka-ma-ro.com/orders',
    reviewUrl: 'https://ka-ma-ro.com/reviews',
    supportUrl: 'https://ka-ma-ro.com/support',
  });

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      setMessage({ type: 'error', text: 'Please enter recipient email' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      let result;

      if (activeTab === 'recommendations') {
        result = await emailService.sendProductRecommendations(recipientEmail, recommendationsData);
      } else if (activeTab === 'abandoned_cart') {
        result = await emailService.sendAbandonedCartEmail(recipientEmail, abandonedCartData);
      } else {
        result = await emailService.sendPostPurchaseEmail(recipientEmail, postPurchaseData);
      }

      if (result.success) {
        setMessage({ type: 'success', text: 'Email sent successfully!' });
        setRecipientEmail('');
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send email' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const addProduct = () => {
    setRecommendationsData({
      ...recommendationsData,
      products: [...recommendationsData.products, { name: '', price: 0, imageUrl: '', url: '' }],
    });
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const updatedProducts = [...recommendationsData.products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setRecommendationsData({ ...recommendationsData, products: updatedProducts });
  };

  const addCartItem = () => {
    setAbandonedCartData({
      ...abandonedCartData,
      cartItems: [
        ...abandonedCartData.cartItems,
        { name: '', quantity: 1, price: 0, imageUrl: '' },
      ],
    });
  };

  const updateCartItem = (index: number, field: string, value: any) => {
    const updatedItems = [...abandonedCartData.cartItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setAbandonedCartData({ ...abandonedCartData, cartItems: updatedItems, cartTotal: total });
  };

  const addOrderItem = () => {
    setPostPurchaseData({
      ...postPurchaseData,
      orderItems: [
        ...postPurchaseData.orderItems,
        { name: '', quantity: 1, price: 0, imageUrl: '' },
      ],
    });
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updatedItems = [...postPurchaseData.orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setPostPurchaseData({ ...postPurchaseData, orderItems: updatedItems, totalAmount: total });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Email Marketing Dashboard</h1>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'recommendations'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Product Recommendations
            </button>
            <button
              onClick={() => setActiveTab('abandoned_cart')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'abandoned_cart'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Abandoned Cart
            </button>
            <button
              onClick={() => setActiveTab('post_purchase')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'post_purchase'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Post-Purchase
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Recipient Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email *
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="customer@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Product Recommendations Form */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={recommendationsData.customerName}
                  onChange={(e) =>
                    setRecommendationsData({ ...recommendationsData, customerName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Products</h3>
                  <button
                    onClick={addProduct}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add Product
                  </button>
                </div>
                {recommendationsData.products.map((product, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Product Name"
                        value={product.name}
                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={product.price}
                        onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={product.imageUrl}
                        onChange={(e) => updateProduct(index, 'imageUrl', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Product URL"
                        value={product.url}
                        onChange={(e) => updateProduct(index, 'url', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Abandoned Cart Form */}
          {activeTab === 'abandoned_cart' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={abandonedCartData.customerName}
                  onChange={(e) =>
                    setAbandonedCartData({ ...abandonedCartData, customerName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Code
                  </label>
                  <input
                    type="text"
                    value={abandonedCartData.discountCode}
                    onChange={(e) =>
                      setAbandonedCartData({ ...abandonedCartData, discountCode: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
                  <input
                    type="number"
                    value={abandonedCartData.discountPercent}
                    onChange={(e) =>
                      setAbandonedCartData({
                        ...abandonedCartData,
                        discountPercent: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Cart Items</h3>
                  <button
                    onClick={addCartItem}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Add Item
                  </button>
                </div>
                {abandonedCartData.cartItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Item Name"
                        value={item.name}
                        onChange={(e) => updateCartItem(index, 'name', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) =>
                          updateCartItem(index, 'quantity', parseInt(e.target.value))
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => updateCartItem(index, 'price', parseFloat(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={item.imageUrl}
                        onChange={(e) => updateCartItem(index, 'imageUrl', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                ))}
                <div className="text-right text-xl font-bold text-gray-900">
                  Total: ${abandonedCartData.cartTotal.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Post-Purchase Form */}
          {activeTab === 'post_purchase' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={postPurchaseData.customerName}
                    onChange={(e) =>
                      setPostPurchaseData({ ...postPurchaseData, customerName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    value={postPurchaseData.orderNumber}
                    onChange={(e) =>
                      setPostPurchaseData({ ...postPurchaseData, orderNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery
                  </label>
                  <input
                    type="text"
                    value={postPurchaseData.estimatedDelivery}
                    onChange={(e) =>
                      setPostPurchaseData({
                        ...postPurchaseData,
                        estimatedDelivery: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={postPurchaseData.trackingNumber}
                    onChange={(e) =>
                      setPostPurchaseData({ ...postPurchaseData, trackingNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Order Items</h3>
                  <button
                    onClick={addOrderItem}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Item
                  </button>
                </div>
                {postPurchaseData.orderItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Item Name"
                        value={item.name}
                        onChange={(e) => updateOrderItem(index, 'name', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) =>
                          updateOrderItem(index, 'quantity', parseInt(e.target.value))
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) =>
                          updateOrderItem(index, 'price', parseFloat(e.target.value))
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={item.imageUrl}
                        onChange={(e) => updateOrderItem(index, 'imageUrl', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                ))}
                <div className="text-right text-xl font-bold text-gray-900">
                  Total: ${postPurchaseData.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="mt-8">
            <button
              onClick={handleSendEmail}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : activeTab === 'recommendations'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : activeTab === 'abandoned_cart'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
