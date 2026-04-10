'use client';

import React from 'react';
import PolicySection from './PolicySection';
import ReturnSteps from './ReturnSteps';
import HighlightBox from './HighlightBox';
import ContactSupport from './ContactSupport';
import RegionalPolicies from './RegionalPolicies';
import ProductSpecificPolicies from './ProductSpecificPolicies';
import Icon from '@/components/ui/AppIcon';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface ContactMethod {
  icon: string;
  label: string;
  value: string;
  href: string;
}

interface RegionalPolicy {
  country: string;
  flag: string;
  returnWindow: string;
  shippingCost: string;
  processingTime: string;
  specialNotes: string[];
}

interface ProductPolicy {
  category: string;
  icon: string;
  requirements: string[];
  notes: string;
}

const RefundPolicyInteractive = () => {
  const returnSteps: Step[] = [
    {
      number: 1,
      title: 'Contact Customer Support',
      description:
        'Reach out to our support team within the eligible return window to initiate your return request. Provide your order number and reason for return.',
    },
    {
      number: 2,
      title: 'Receive Return Authorization',
      description:
        'Our team will review your request and provide a Return Authorization (RA) number along with detailed return shipping instructions.',
    },
    {
      number: 3,
      title: 'Package Your Item',
      description:
        'Securely pack the item in its original packaging with all accessories, manuals, and documentation. Include the RA number inside the package.',
    },
    {
      number: 4,
      title: 'Ship the Return',
      description:
        'Ship the package using the provided return label or approved shipping method. Keep your tracking number for reference.',
    },
    {
      number: 5,
      title: 'Inspection & Refund',
      description:
        'Once we receive and inspect your return, your refund will be processed within 5-10 business days to your original payment method.',
    },
  ];

  const contactMethods: ContactMethod[] = [
    {
      icon: 'EnvelopeIcon',
      label: 'Email Support',
      value: 'returns@kamaro.com',
      href: 'mailto:returns@kamaro.com',
    },
    {
      icon: 'PhoneIcon',
      label: 'Phone Support',
      value: '+1 (800) 555-0199',
      href: 'tel:+18005550199',
    },
    {
      icon: 'ChatBubbleLeftRightIcon',
      label: 'Live Chat',
      value: 'Available 9 AM - 6 PM EST',
      href: '#',
    },
    {
      icon: 'QuestionMarkCircleIcon',
      label: 'Help Center',
      value: 'Browse FAQs & Guides',
      href: '#',
    },
  ];

  const regionalPolicies: RegionalPolicy[] = [
    {
      country: 'United States',
      flag: '🇺🇸',
      returnWindow: '30 days',
      shippingCost: 'Free return shipping',
      processingTime: '5-7 business days',
      specialNotes: [
        'Free return shipping labels provided for all eligible returns',
        'Refunds issued to original payment method',
        'Extended 60-day return window during holiday season (Nov 1 - Jan 15)',
      ],
    },
    {
      country: 'United Kingdom',
      flag: '🇬🇧',
      returnWindow: '14 days',
      shippingCost: 'Customer pays return shipping',
      processingTime: '7-10 business days',
      specialNotes: [
        'Consumer Rights Act 2015 applies to all purchases',
        'Refunds include original shipping costs for faulty items',
        'Returns must be postmarked within 14 days of delivery',
      ],
    },
    {
      country: 'European Union',
      flag: '🇪🇺',
      returnWindow: '14 days',
      shippingCost: 'Customer pays return shipping',
      processingTime: '7-14 business days',
      specialNotes: [
        'EU Consumer Rights Directive applies',
        'Right of withdrawal for distance purchases',
        'Refunds processed within 14 days of receiving returned item',
      ],
    },
    {
      country: 'Canada',
      flag: '🇨🇦',
      returnWindow: '30 days',
      shippingCost: 'Free return shipping',
      processingTime: '5-10 business days',
      specialNotes: [
        'Free return shipping for orders over CAD $100',
        'Provincial consumer protection laws apply',
        'Customs duties refunded for international returns',
      ],
    },
  ];

  const productPolicies: ProductPolicy[] = [
    {
      category: 'Smartphones',
      icon: 'DevicePhoneMobileIcon',
      requirements: [
        'Must be in original, unopened packaging for full refund',
        'Factory seal must be intact and unbroken',
        'All original accessories and documentation included',
        'IMEI number must match purchase records',
        'Device must not be activated or registered',
      ],
      notes:
        'Opened smartphones may be subject to a 15% restocking fee. Please ensure device data is backed up and erased before return.',
    },
    {
      category: 'Phone Accessories',
      icon: 'BoltIcon',
      requirements: [
        'Unused and in original packaging',
        'All components and parts included',
        'No signs of wear or damage',
        'Protective films and seals intact',
        'Original purchase receipt required',
      ],
      notes:
        'Hygiene-sensitive items (earbuds, screen protectors) must be unopened for return eligibility.',
    },
  ];

  const generalPolicySections = [
    {
      title: 'Return Eligibility',
      icon: '✅',
      content: [
        'Items must be returned within 30 days of delivery for most regions (check regional policies for specific timeframes).',
        'Products must be in their original condition, unused, and in original packaging with all accessories, manuals, and documentation.',
        'Proof of purchase (order confirmation or receipt) is required for all returns.',
        'Items showing signs of use, damage, or missing components may not be eligible for full refund.',
      ],
    },
    {
      title: 'Non-Returnable Items',
      icon: '❌',
      content: [
        'Opened software, digital downloads, or activated service plans cannot be returned.',
        'Items marked as final sale, clearance, or non-returnable at time of purchase.',
        'Gift cards, prepaid cards, and promotional items are not eligible for return.',
        'Custom-configured or personalized products cannot be returned unless defective.',
      ],
    },
    {
      title: 'Refund Processing',
      icon: '💳',
      content: [
        'Refunds are processed within 5-10 business days after we receive and inspect your return.',
        'Refunds are issued to the original payment method used for purchase.',
        'Original shipping costs are non-refundable unless the return is due to our error or a defective product.',
        'You will receive an email confirmation once your refund has been processed.',
      ],
    },
    {
      title: 'Defective or Damaged Items',
      icon: '🔧',
      content: [
        'If you receive a defective or damaged item, contact us immediately with photos of the damage.',
        'We will provide a prepaid return label and expedite a replacement or full refund including shipping costs.',
        'Defective items are covered under our quality guarantee and manufacturer warranties.',
        'No restocking fees apply to defective or damaged products.',
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <HighlightBox
        type="info"
        title="Customer Satisfaction Guarantee"
        content={[
          'We stand behind the quality of our products and want you to be completely satisfied with your purchase.',
          'Our return policy is designed to be fair, transparent, and customer-friendly.',
          'If you have any questions or concerns, our support team is here to help.',
        ]}
      />

      {generalPolicySections.map((section, index) => (
        <PolicySection
          key={index}
          title={section.title}
          icon={section.icon}
          content={section.content}
        />
      ))}

      <ReturnSteps steps={returnSteps} />

      <RegionalPolicies policies={regionalPolicies} />

      <ProductSpecificPolicies policies={productPolicies} />

      <HighlightBox
        type="warning"
        title="Important Data Security Notice"
        content={[
          'Before returning any smartphone or device, please back up all personal data.',
          'Perform a factory reset to erase all personal information from the device.',
          'Remove SIM cards, memory cards, and any personal accessories.',
          'Ka-ma-ro is not responsible for any data left on returned devices.',
        ]}
      />

      <ContactSupport methods={contactMethods} />

      <div className="bg-muted/50 rounded-lg p-6 border border-border">
        <div className="flex items-start gap-3">
          <Icon name="ShieldCheckIcon" size={24} className="text-success flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              Secure Purchase Protection
            </h3>
            <p className="text-foreground/80 text-sm leading-relaxed">
              All purchases are protected by our comprehensive return policy and quality guarantee.
              Shop with confidence knowing that your satisfaction is our priority. We process all
              returns fairly and transparently, ensuring you receive the service you deserve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyInteractive;
