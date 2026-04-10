'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import PolicySection from './PolicySection';
import ShippingTable from './ShippingTable';
import InfoCard from './InfoCard';
import ContactSupport from './ContactSupport';

interface ShippingRate {
  region: string;
  standardTime: string;
  standardCost: string;
  expressTime: string;
  expressCost: string;
}

const ShippingPolicyInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('United States');

  useEffect(() => {
    setIsHydrated(true);
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry) {
      setSelectedCountry(savedCountry);
    }
  }, []);

  const shippingRates: ShippingRate[] = [
    {
      region: 'United States',
      standardTime: '5-7 business days',
      standardCost: 'Free over $50',
      expressTime: '2-3 business days',
      expressCost: '$15.99',
    },
    {
      region: 'Canada',
      standardTime: '7-10 business days',
      standardCost: 'Free over $75',
      expressTime: '3-5 business days',
      expressCost: '$24.99',
    },
    {
      region: 'United Kingdom',
      standardTime: '7-12 business days',
      standardCost: 'Free over £60',
      expressTime: '4-6 business days',
      expressCost: '£19.99',
    },
    {
      region: 'European Union',
      standardTime: '8-14 business days',
      standardCost: 'Free over €70',
      expressTime: '5-7 business days',
      expressCost: '€24.99',
    },
    {
      region: 'Australia',
      standardTime: '10-15 business days',
      standardCost: 'Free over $100',
      expressTime: '6-8 business days',
      expressCost: '$29.99',
    },
    {
      region: 'Asia Pacific',
      standardTime: '10-18 business days',
      standardCost: 'Free over $80',
      expressTime: '6-10 business days',
      expressCost: '$34.99',
    },
  ];

  const processingInfo = [
    'Orders are processed within 1-2 business days (Monday-Friday, excluding holidays)',
    'You will receive an email confirmation once your order has been shipped',
    'Processing times may be extended during peak seasons and promotional periods',
    'Custom or personalized orders may require additional processing time',
  ];

  const trackingInfo = [
    'All shipments include tracking numbers sent via email',
    'Track your order status in real-time through our website or carrier portal',
    'Signature may be required for high-value electronics shipments',
    'Insurance is automatically included for orders over $500',
  ];

  const restrictionsInfo = [
    'Some regions may have import restrictions on electronics',
    'Customers are responsible for any customs duties or import taxes',
    'Lithium battery regulations apply to smartphone shipments',
    'P.O. Box addresses may not be available for all shipping methods',
  ];

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-lg w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <Link
            href="/home-product-showcase"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-smooth mb-4"
          >
            <Icon name="ArrowLeftIcon" size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl text-foreground mb-4">
            Shipping Policy
          </h1>
          <p className="text-foreground/70 text-lg">Last updated: January 14, 2026</p>
        </div>

        <div className="bg-card rounded-lg elevation-2 p-6 sm:p-8 mb-8">
          <p className="text-foreground/80 leading-relaxed mb-6">
            At Ka-ma-ro, we are committed to delivering your premium smartphones and accessories
            safely and efficiently. This shipping policy outlines our delivery options, timeframes,
            and procedures for domestic and international shipments.
          </p>

          <PolicySection
            title="Shipping Methods & Delivery Times"
            icon="🚚"
            content={[
              `We offer multiple shipping options to meet your needs. Delivery times vary based on your location and selected shipping method. All timeframes are estimates and begin after order processing is complete.`,
              `Free standard shipping is available on qualifying orders based on your region. Express shipping options are available for faster delivery at an additional cost.`,
            ]}
          />

          <ShippingTable rates={shippingRates} />

          <PolicySection
            title="Order Processing"
            icon="📦"
            content={[
              `All orders are carefully processed and packaged to ensure your electronics arrive in perfect condition. Our fulfillment team inspects each item before shipping.`,
              `Orders placed on weekends or holidays will be processed on the next business day. You will receive tracking information via email once your order ships.`,
            ]}
          />

          <InfoCard title="Processing Timeline" items={processingInfo} variant="default" />

          <PolicySection
            title="International Shipping"
            icon="🌍"
            content={[
              `Ka-ma-ro ships to multiple countries worldwide. International orders may be subject to customs clearance procedures, which can affect delivery times.`,
              `Customers are responsible for any customs duties, taxes, or fees imposed by their country. These charges are not included in our shipping costs and must be paid by the recipient upon delivery.`,
              `We comply with all international shipping regulations for electronics, including lithium battery restrictions and customs documentation requirements.`,
            ]}
          />

          <InfoCard title="Tracking & Insurance" items={trackingInfo} variant="success" />

          <PolicySection
            title="Shipping Restrictions"
            icon="⚠️"
            content={[
              `Certain shipping restrictions apply to electronics and lithium battery-powered devices. We comply with all carrier and international regulations.`,
              `Some remote or restricted areas may not be eligible for all shipping methods. Additional fees may apply for deliveries to these locations.`,
            ]}
          />

          <InfoCard title="Important Restrictions" items={restrictionsInfo} variant="warning" />

          <PolicySection
            title="Delivery Issues"
            icon="🔔"
            content={[
              `If your package is lost, damaged, or delayed beyond the estimated delivery window, please contact our customer support team immediately.`,
              `We work closely with our shipping partners to resolve any delivery issues quickly. Claims for lost or damaged shipments must be filed within 30 days of the expected delivery date.`,
              `For high-value orders, signature confirmation may be required. If you are not available to sign, the carrier will leave a notice with instructions for pickup or redelivery.`,
            ]}
          />

          <ContactSupport />

          <div className="bg-muted/50 rounded-lg p-6 border border-border">
            <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
              Related Policies
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/refund-policy"
                className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-muted transition-smooth touch-target"
              >
                <Icon name="ArrowPathIcon" size={18} />
                <span className="font-medium">Refund Policy</span>
              </Link>
              <Link
                href="/home-product-showcase"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-smooth touch-target"
              >
                <Icon name="ShoppingBagIcon" size={18} />
                <span className="font-medium">Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center py-8 border-t border-border">
          <p className="caption text-muted-foreground">
            © {new Date().getFullYear()} Ka-ma-ro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyInteractive;
