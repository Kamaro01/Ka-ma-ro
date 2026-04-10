'use client';

import React, { useEffect, useState } from 'react';
import {
  SparklesIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  ClockIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import {
  businessSettingsService,
  BusinessSettings,
  CustomerPreferences,
} from '@/services/businessSettingsService';
import { useAuth } from '@/contexts/AuthContext';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stats?: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, stats, color }) => (
  <div
    className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 ${color}`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
        {icon}
      </div>
      {stats && (
        <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
          {stats}
        </span>
      )}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function CustomerExperienceInteractive() {
  const { user } = useAuth();
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [customerPreferences, setCustomerPreferences] = useState<CustomerPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const settings = await businessSettingsService.getBusinessSettings();
    setBusinessSettings(settings);

    if (user?.id) {
      const prefs = await businessSettingsService.getCustomerPreferences(user.id);
      setCustomerPreferences(prefs);
    }
    setLoading(false);
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      en: 'English',
      rw: 'Kinyarwanda',
      fr: 'French',
    };
    return languages[code] || 'English';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Customer Experience Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <SparklesIcon className="h-16 w-16 text-yellow-300 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Customer Experience Enhancement Hub
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Elevate your shopping journey with AI-powered recommendations, local market insights,
              and personalized features designed specifically for Rwanda customers
            </p>
          </div>
        </div>
      </div>

      {/* Business Information Banner */}
      {businessSettings && (
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Language:</span>
                <span className="text-gray-900">
                  {getLanguageName(businessSettings.primary_language)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <ClockIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium">Business Hours:</span>
                <span className="text-gray-900">
                  {businessSettings.business_hours_start} - {businessSettings.business_hours_end}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CreditCardIcon className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Payment:</span>
                <span className="text-gray-900">
                  {businessSettings.require_advance_payment
                    ? `${businessSettings.advance_payment_percentage}% Advance Payment`
                    : 'Cash on Delivery Available'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Dashboard Section */}
      {user && customerPreferences && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <TrophyIcon className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
                <p className="text-3xl font-bold">{customerPreferences.loyalty_points}</p>
                <p className="text-blue-100">Loyalty Points</p>
              </div>
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-green-300" />
                <p className="text-3xl font-bold">{customerPreferences.engagement_score}%</p>
                <p className="text-blue-100">Engagement Score</p>
              </div>
              <div className="text-center">
                <StarIcon className="h-12 w-12 mx-auto mb-2 text-pink-300" />
                <p className="text-3xl font-bold">Premium</p>
                <p className="text-blue-100">Member Status</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<SparklesIcon className="h-8 w-8 text-purple-600" />}
            title="AI-Powered Recommendations"
            description="Get personalized product suggestions based on your browsing history, seasonal trends in Rwanda, and local purchasing patterns with real-time inventory integration"
            stats="95% Match"
            color="border-purple-500"
          />

          <FeatureCard
            icon={<ShoppingBagIcon className="h-8 w-8 text-blue-600" />}
            title="Smart Shopping Assistant"
            description="Size recommendations for smartphones, compatibility checking for accessories, and budget optimization tools aligned with local purchasing power"
            stats="Active"
            color="border-blue-500"
          />

          <FeatureCard
            icon={<MapPinIcon className="h-8 w-8 text-green-600" />}
            title="Rwanda Address System"
            description="Integrated with Rwanda's administrative structure: Province → District → Sector → Cell → Village for accurate delivery across all regions"
            color="border-green-500"
          />

          <FeatureCard
            icon={<ChatBubbleLeftRightIcon className="h-8 w-8 text-pink-600" />}
            title="Local Market Integration"
            description="Rwanda-specific promotions, seasonal offers during harvest periods, and community-driven product reviews from verified local customers"
            stats="Live"
            color="border-pink-500"
          />

          <FeatureCard
            icon={<CalendarDaysIcon className="h-8 w-8 text-orange-600" />}
            title="Digital Consultation"
            description="Virtual product demonstrations, live chat support during 9am-6pm business hours, and appointment scheduling for technical assistance"
            stats="Available"
            color="border-orange-500"
          />

          <FeatureCard
            icon={<UserGroupIcon className="h-8 w-8 text-indigo-600" />}
            title="Social Commerce"
            description="Community wishlists, local influencer recommendations, and peer-to-peer product sharing within Rwanda customer networks"
            color="border-indigo-500"
          />

          <FeatureCard
            icon={<TrophyIcon className="h-8 w-8 text-yellow-600" />}
            title="Gamification Rewards"
            description="Earn points for reviews, referrals within local communities, and loyalty milestones celebrating your customer anniversaries"
            stats="+150 pts"
            color="border-yellow-500"
          />

          <FeatureCard
            icon={<ChartBarIcon className="h-8 w-8 text-red-600" />}
            title="Advanced Analytics"
            description="Track your satisfaction metrics, Net Promoter Scores specific to Rwanda market, and receive continuous improvement suggestions"
            color="border-red-500"
          />

          <FeatureCard
            icon={<BellIcon className="h-8 w-8 text-teal-600" />}
            title="Mobile-First Design"
            description="Native app-like experience with push notifications for personalized offers, simplified social sharing, and comprehensive customer optimization"
            color="border-teal-500"
          />
        </div>
      </div>

      {/* Contact & Support Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Need Assistance? We&apos;re Here to Help!
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-xl">
              <PhoneIcon className="h-12 w-12 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Email Support</h3>
                <p className="text-gray-600">{businessSettings?.support_email}</p>
                <p className="text-sm text-gray-500 mt-1">Response within 24 hours</p>
              </div>
            </div>
            {businessSettings?.support_whatsapp && (
              <div className="flex items-center gap-4 p-6 bg-green-50 rounded-xl">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">WhatsApp Direct</h3>
                  <a
                    href={`https://wa.me/${businessSettings.support_whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    {businessSettings.support_whatsapp}
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Instant messaging support</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience the Future of Shopping?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers across Rwanda enjoying personalized shopping
            experiences
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg">
              Get Started
            </button>
            <button className="bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition-colors shadow-lg">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
