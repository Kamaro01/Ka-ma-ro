'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface RegionalPolicy {
  country: string;
  flag: string;
  returnWindow: string;
  shippingCost: string;
  processingTime: string;
  specialNotes: string[];
}

interface RegionalPoliciesProps {
  policies: RegionalPolicy[];
}

const RegionalPolicies = ({ policies }: RegionalPoliciesProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');

  useEffect(() => {
    setIsHydrated(true);
    const savedCountry = localStorage.getItem('selectedCountry') || 'United States';
    setSelectedCountry(savedCountry);
  }, []);

  if (!isHydrated) {
    return (
      <section className="mb-8">
        <h2 className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-4">
          Regional Return Policies
        </h2>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </section>
    );
  }

  const currentPolicy = policies.find((p) => p.country === selectedCountry) || policies[0];

  return (
    <section className="mb-8">
      <h2 className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-4">
        Regional Return Policies
      </h2>
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{currentPolicy.flag}</span>
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">
              {currentPolicy.country}
            </h3>
            <p className="caption text-muted-foreground">Return policy specific to your region</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-background rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="ClockIcon" size={20} className="text-accent" />
              <p className="caption text-muted-foreground">Return Window</p>
            </div>
            <p className="font-semibold text-foreground">{currentPolicy.returnWindow}</p>
          </div>

          <div className="p-4 bg-background rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="TruckIcon" size={20} className="text-accent" />
              <p className="caption text-muted-foreground">Shipping Cost</p>
            </div>
            <p className="font-semibold text-foreground">{currentPolicy.shippingCost}</p>
          </div>

          <div className="p-4 bg-background rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="ArrowPathIcon" size={20} className="text-accent" />
              <p className="caption text-muted-foreground">Processing Time</p>
            </div>
            <p className="font-semibold text-foreground">{currentPolicy.processingTime}</p>
          </div>
        </div>

        {currentPolicy.specialNotes.length > 0 && (
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-3">
              Special Notes for {currentPolicy.country}
            </h4>
            <ul className="space-y-2">
              {currentPolicy.specialNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-2 text-foreground/80 text-sm">
                  <Icon
                    name="CheckCircleIcon"
                    size={16}
                    className="text-success flex-shrink-0 mt-0.5"
                  />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default RegionalPolicies;
