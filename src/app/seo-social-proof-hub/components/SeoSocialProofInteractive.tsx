'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  StarIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { seoService, SeoPage, TrustBadge, SocialProof } from '@/services/seoService';
import Icon from '@/components/ui/AppIcon';

interface TabType {
  id: string;
  name: string;
  icon: any;
}

const tabs: TabType[] = [
  { id: 'overview', name: 'SEO Overview', icon: ChartBarIcon },
  { id: 'pages', name: 'Page SEO', icon: DocumentTextIcon },
  { id: 'structured-data', name: 'Structured Data', icon: CodeBracketIcon },
  { id: 'trust-badges', name: 'Trust Badges', icon: ShieldCheckIcon },
  { id: 'social-proof', name: 'Social Proof', icon: StarIcon },
];

export default function SeoSocialProofInteractive() {
  const [activeTab, setActiveTab] = useState('overview');
  const [seoPages, setSeoPages] = useState<SeoPage[]>([]);
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>([]);
  const [socialProofs, setSocialProofs] = useState<SocialProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalPageViews: 0,
    totalVisitors: 0,
    totalOrganicTraffic: 0,
    totalConversions: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pages, badges, proofs, analyticsData] = await Promise.all([
        seoService.getAllSeoPages(),
        seoService.getAllTrustBadges(),
        seoService.getAllSocialProofs(),
        seoService.getTotalAnalytics(),
      ]);

      setSeoPages(pages);
      setTrustBadges(badges);
      setSocialProofs(proofs);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* SEO Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Page Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalPageViews.toLocaleString()}
              </p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-blue-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">Last 30 days</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalVisitors.toLocaleString()}
              </p>
            </div>
            <GlobeAltIcon className="w-12 h-12 text-green-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">Last 30 days</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Organic Traffic</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalOrganicTraffic.toLocaleString()}
              </p>
            </div>
            <MagnifyingGlassIcon className="w-12 h-12 text-purple-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">Search engine visits</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalConversions.toLocaleString()}
              </p>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-yellow-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">Last 30 days</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('pages')}
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <DocumentTextIcon className="w-8 h-8 text-blue-500 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Optimize Pages</p>
              <p className="text-sm text-gray-500">Manage meta tags</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('trust-badges')}
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <ShieldCheckIcon className="w-8 h-8 text-green-500 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Trust Badges</p>
              <p className="text-sm text-gray-500">Build credibility</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('social-proof')}
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all"
          >
            <StarIcon className="w-8 h-8 text-yellow-500 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Testimonials</p>
              <p className="text-sm text-gray-500">Customer reviews</p>
            </div>
          </button>
        </div>
      </div>

      {/* SEO Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Optimize Page Titles</p>
              <p className="text-sm text-gray-600">
                Keep titles between 30-60 characters for best results
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Write Compelling Descriptions</p>
              <p className="text-sm text-gray-600">
                Meta descriptions should be 120-160 characters
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Use Structured Data</p>
              <p className="text-sm text-gray-600">Add schema markup for rich search results</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Build Trust Signals</p>
              <p className="text-sm text-gray-600">Display security badges and customer reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPages = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">SEO Pages Management</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage meta tags and SEO settings for all pages
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seoPages?.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{page.page_path}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{page.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-md">
                      {page.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {page.page_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{page.priority?.toFixed(1)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {page.is_active ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStructuredData = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Structured Data (Schema Markup)
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Schema markup helps search engines understand your content and display rich results
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Organization Schema</h4>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
              {`{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Ka-ma-ro Electronics",
  "url": "https://ka-ma-ro.com",
  "logo": "https://ka-ma-ro.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+250788000000",
    "contactType": "Customer Service"
  }
}`}
            </pre>
          </div>

          <div className="border-2 border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Product Schema</h4>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
              {`{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "image": "product-image.jpg",
  "offers": {
    "@type": "Offer",
    "price": "499.99",
    "priceCurrency": "RWF"
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrustBadges = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Badges</h3>
        <p className="text-sm text-gray-600 mb-6">
          Display security certifications and trust signals to build customer confidence
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustBadges?.map((badge) => (
            <div
              key={badge.id}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all"
            >
              <img
                src={badge.image_url || '/assets/images/no_image.png'}
                alt={badge.image_alt}
                className="w-16 h-16 object-contain mx-auto mb-3"
              />
              <h4 className="font-medium text-gray-900 text-center">{badge.title}</h4>
              <p className="text-sm text-gray-600 text-center mt-2">{badge.description}</p>
              <div className="mt-3 flex justify-center">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {badge.badge_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSocialProof = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Testimonials</h3>
        <p className="text-sm text-gray-600 mb-6">
          Showcase verified customer reviews and social validation
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socialProofs
            ?.filter((p) => p.proof_type === 'testimonial')
            ?.map((proof) => (
              <div
                key={proof.id}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-yellow-500 transition-all"
              >
                <div className="flex items-center mb-3">
                  {proof.rating && (
                    <div className="flex items-center mr-3">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(proof.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  {proof.is_verified && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                </div>

                <h4 className="font-medium text-gray-900 mb-2">{proof.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{proof.content}</p>

                <div className="flex items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{proof.author_name}</p>
                    <p className="text-xs text-gray-500">{proof.author_title}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Trust Scores */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {socialProofs
            ?.filter((p) => ['review_aggregate', 'trust_score'].includes(p.proof_type))
            ?.map((proof) => (
              <div key={proof.id} className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {proof.rating?.toFixed(1)}
                  <span className="text-2xl text-gray-600">/5.0</span>
                </div>
                <p className="text-sm font-medium text-gray-700">{proof.title}</p>
                <p className="text-xs text-gray-500 mt-1">{proof.content}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-2">
            <MagnifyingGlassIcon className="w-10 h-10 mr-3" />
            <h1 className="text-3xl font-bold">SEO & Social Proof Hub</h1>
          </div>
          <p className="text-blue-100 max-w-3xl">
            Optimize your website for search engines and build customer trust with comprehensive SEO
            tools and social validation
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'pages' && renderPages()}
            {activeTab === 'structured-data' && renderStructuredData()}
            {activeTab === 'trust-badges' && renderTrustBadges()}
            {activeTab === 'social-proof' && renderSocialProof()}
          </>
        )}
      </div>
    </div>
  );
}
