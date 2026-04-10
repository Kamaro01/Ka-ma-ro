'use client';

import React, { useState } from 'react';
import {
  ClockIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  BellAlertIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import Icon from '@/components/ui/AppIcon';

interface BusinessHours {
  start: string;
  end: string;
  timezone: string;
}

interface PaymentConfig {
  advancePaymentPercentage: number;
  enableCashOnDelivery: boolean;
  acceptedMethods: string[];
}

interface AddressSystem {
  provinceEnabled: boolean;
  districtEnabled: boolean;
  sectorEnabled: boolean;
  cellEnabled: boolean;
}

interface LanguageSettings {
  primaryLanguage: string;
  secondaryLanguages: string[];
}

const RwandaBusinessSettingsInteractive: React.FC = () => {
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    start: '09:00',
    end: '18:00',
    timezone: 'CAT (Central Africa Time)',
  });

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    advancePaymentPercentage: 30,
    enableCashOnDelivery: false,
    acceptedMethods: ['MTN Mobile Money', 'Airtel Money'],
  });

  const [addressSystem, setAddressSystem] = useState<AddressSystem>({
    provinceEnabled: true,
    districtEnabled: true,
    sectorEnabled: true,
    cellEnabled: true,
  });

  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    primaryLanguage: 'English',
    secondaryLanguages: ['Kinyarwanda'],
  });

  const [activeSection, setActiveSection] = useState<string>('hours');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const secondaryLanguages = languageSettings.secondaryLanguages;
  const acceptedMethods = paymentConfig.acceptedMethods;

  const handleSaveSettings = () => {
    // Simulate save operation
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const sections = [
    { id: 'hours', name: 'Business Hours', icon: ClockIcon },
    { id: 'language', name: 'Language', icon: GlobeAltIcon },
    { id: 'payment', name: 'Payment', icon: CurrencyDollarIcon },
    { id: 'address', name: 'Address System', icon: MapPinIcon },
    { id: 'support', name: 'Customer Support', icon: PhoneIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Rwanda Business Settings Configuration
        </h1>
        <p className="text-muted-foreground">
          Customize location-specific operational parameters for the Rwandan market
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="mb-6 bg-success/10 border border-success/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircleIcon className="w-6 h-6 text-success flex-shrink-0" />
          <span className="text-success font-medium">{saveMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="font-semibold text-foreground mb-4">Settings</h2>
            <nav className="space-y-2">
              {sections?.map((section) => {
                const Icon = section?.icon;
                return (
                  <button
                    key={section?.id}
                    onClick={() => setActiveSection(section?.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section?.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-lg p-6">
            {/* Business Hours Section */}
            {activeSection === 'hours' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Business Hours</h2>
                  <p className="text-muted-foreground mb-6">
                    Configure your operational hours and timezone settings
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={businessHours?.start}
                      onChange={(e) =>
                        setBusinessHours({ ...businessHours, start: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={businessHours?.end}
                      onChange={(e) => setBusinessHours({ ...businessHours, end: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
                  <select
                    value={businessHours?.timezone}
                    onChange={(e) =>
                      setBusinessHours({ ...businessHours, timezone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  >
                    <option value="CAT (Central Africa Time)">CAT (Central Africa Time)</option>
                    <option value="EAT (East Africa Time)">EAT (East Africa Time)</option>
                  </select>
                </div>

                <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex gap-3">
                  <InformationCircleIcon className="w-6 h-6 text-info flex-shrink-0" />
                  <div className="text-sm text-info">
                    <p className="font-medium mb-1">Current Configuration:</p>
                    <p>
                      Your business operates from {businessHours?.start} to {businessHours?.end} in{' '}
                      {businessHours?.timezone}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Language Section */}
            {activeSection === 'language' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Language Preferences
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Configure primary and secondary language settings for customer communications
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Primary Language
                  </label>
                  <select
                    value={languageSettings?.primaryLanguage}
                    onChange={(e) =>
                      setLanguageSettings({ ...languageSettings, primaryLanguage: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  >
                    <option value="English">English</option>
                    <option value="French">French</option>
                    <option value="Kinyarwanda">Kinyarwanda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Secondary Languages
                  </label>
                  <div className="space-y-2">
                    {['Kinyarwanda', 'French', 'Swahili']?.map((lang) => (
                      <label
                        key={lang}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={secondaryLanguages.includes(lang)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLanguageSettings({
                                ...languageSettings,
                                secondaryLanguages: [...secondaryLanguages, lang],
                              });
                            } else {
                              setLanguageSettings({
                                ...languageSettings,
                                secondaryLanguages: secondaryLanguages.filter((l) => l !== lang),
                              });
                            }
                          }}
                          className="w-4 h-4 text-primary focus:ring-primary focus:ring-2 rounded border-border"
                        />
                        <span className="text-foreground">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <p className="text-sm text-success">
                    <strong>Official Language:</strong> {languageSettings?.primaryLanguage} is now
                    the primary language for all customer communications.
                  </p>
                </div>
              </div>
            )}

            {/* Payment Configuration Section */}
            {activeSection === 'payment' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Payment Configuration
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Configure payment methods and advance payment requirements
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Advance Payment Percentage
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={paymentConfig?.advancePaymentPercentage}
                      onChange={(e) =>
                        setPaymentConfig({
                          ...paymentConfig,
                          advancePaymentPercentage: parseInt(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold text-primary min-w-[60px]">
                      {paymentConfig?.advancePaymentPercentage}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Customers must pay {paymentConfig?.advancePaymentPercentage}% of the order
                    amount in advance
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4 bg-destructive/5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentConfig?.enableCashOnDelivery}
                      onChange={(e) =>
                        setPaymentConfig({
                          ...paymentConfig,
                          enableCashOnDelivery: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary focus:ring-primary focus:ring-2 rounded border-border"
                    />
                    <div>
                      <span className="font-medium text-foreground">Enable Cash on Delivery</span>
                      <p className="text-sm text-muted-foreground">
                        {paymentConfig?.enableCashOnDelivery
                          ? 'Cash on delivery is currently enabled'
                          : 'Cash on delivery is disabled (advance payment required)'}
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Accepted Payment Methods
                  </label>
                  <div className="space-y-2">
                    {['MTN Mobile Money', 'Airtel Money']?.map((method) => (
                      <label
                        key={method}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={acceptedMethods.includes(method)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPaymentConfig({
                                ...paymentConfig,
                                acceptedMethods: [...acceptedMethods, method],
                              });
                            } else {
                              setPaymentConfig({
                                ...paymentConfig,
                                acceptedMethods: acceptedMethods.filter((m) => m !== method),
                              });
                            }
                          }}
                          className="w-4 h-4 text-primary focus:ring-primary focus:ring-2 rounded border-border"
                        />
                        <span className="text-foreground">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Address System Section */}
            {activeSection === 'address' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Address System</h2>
                  <p className="text-muted-foreground mb-6">
                    Configure Rwanda-specific address hierarchy for accurate delivery management
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                    <div>
                      <span className="font-medium text-foreground">Province Level</span>
                      <p className="text-sm text-muted-foreground">
                        Enable province selection in addresses
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={addressSystem?.provinceEnabled}
                      onChange={(e) =>
                        setAddressSystem({ ...addressSystem, provinceEnabled: e.target.checked })
                      }
                      className="w-5 h-5 text-primary focus:ring-primary focus:ring-2 rounded border-border"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                    <div>
                      <span className="font-medium text-foreground">District Level</span>
                      <p className="text-sm text-muted-foreground">
                        Enable district selection in addresses
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={addressSystem?.districtEnabled}
                      onChange={(e) =>
                        setAddressSystem({ ...addressSystem, districtEnabled: e.target.checked })
                      }
                      className="w-5 h-5 text-primary focus:ring-primary focus:ring-2 rounded border-border"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                    <div>
                      <span className="font-medium text-foreground">Sector Level</span>
                      <p className="text-sm text-muted-foreground">
                        Enable sector selection in addresses
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={addressSystem?.sectorEnabled}
                      onChange={(e) =>
                        setAddressSystem({ ...addressSystem, sectorEnabled: e.target.checked })
                      }
                      className="w-5 h-5 text-primary focus:ring-primary focus:ring-2 rounded border-border"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                    <div>
                      <span className="font-medium text-foreground">Cell Level</span>
                      <p className="text-sm text-muted-foreground">
                        Enable cell selection in addresses
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={addressSystem?.cellEnabled}
                      onChange={(e) =>
                        setAddressSystem({ ...addressSystem, cellEnabled: e.target.checked })
                      }
                      className="w-5 h-5 text-primary focus:ring-primary focus:ring-2 rounded border-border"
                    />
                  </label>
                </div>

                <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                  <p className="text-sm text-info">
                    <strong>Address Format:</strong>{' '}
                    {[
                      addressSystem?.provinceEnabled && 'Province',
                      addressSystem?.districtEnabled && 'District',
                      addressSystem?.sectorEnabled && 'Sector',
                      addressSystem?.cellEnabled && 'Cell',
                    ]
                      ?.filter(Boolean)
                      ?.join(' → ') || 'No address levels enabled'}
                  </p>
                </div>
              </div>
            )}

            {/* Customer Support Section */}
            {activeSection === 'support' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Customer Support</h2>
                  <p className="text-muted-foreground mb-6">
                    Configure customer service parameters and contact methods
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-2">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <PhoneIcon className="w-5 h-5 text-primary" />
                        <span className="text-foreground">
                          WhatsApp: Available for direct customer messaging
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BellAlertIcon className="w-5 h-5 text-primary" />
                        <span className="text-foreground">Email: Kamarofisto@gmail.com</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-2">Business Hours Response</h3>
                    <p className="text-sm text-muted-foreground">
                      Customer inquiries received during business hours ({businessHours?.start} -{' '}
                      {businessHours?.end}) will receive priority response. After-hours inquiries
                      will be addressed the next business day.
                    </p>
                  </div>

                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <h3 className="font-medium text-success mb-2">Accessibility Compliance</h3>
                    <p className="text-sm text-success">
                      All customer service channels are configured to meet WCAG 2.1 AA standards
                      with screen reader compatibility and keyboard navigation support.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-border">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RwandaBusinessSettingsInteractive;
