'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { Currency, CURRENCIES } from '@/utils/currencyConverter';

interface CountrySelectorProps {
  onCountryChange: (currency: Currency) => void;
}

const CountrySelector = ({ onCountryChange }: CountrySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Currency>(CURRENCIES[0]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      onCountryChange(selectedCountry);
    }
  }, [isHydrated, selectedCountry, onCountryChange]);

  const handleCountrySelect = (country: Currency) => {
    setSelectedCountry(country);
    onCountryChange(country);
    setIsOpen(false);
  };

  if (!isHydrated) {
    return <div className="w-40 h-10 bg-card rounded-md border border-border animate-pulse" />;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-card rounded-md border border-border hover:bg-muted transition-smooth touch-target"
        aria-label="Select country and currency"
      >
        <span className="text-2xl">{selectedCountry.flag}</span>
        <span className="font-medium text-sm text-foreground">{selectedCountry.symbol}</span>
        <Icon
          name={isOpen ? 'ChevronUpIcon' : 'ChevronDownIcon'}
          size={16}
          className="text-muted-foreground"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card rounded-md border border-border shadow-lg z-50">
          <div className="py-1">
            {CURRENCIES.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCountrySelect(country)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-smooth text-left"
              >
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground">{country.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {country.code} ({country.symbol})
                  </div>
                </div>
                {selectedCountry.code === country.code && (
                  <Icon name="CheckIcon" size={16} className="text-orange-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
