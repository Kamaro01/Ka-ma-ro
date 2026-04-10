'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileSection from './ProfileSection';
import OrderHistoryCard from './OrderHistoryCard';
import AddressManagement from './AddressManagement';
import AccountSettings from './AccountSettings';
import QuickActions from './QuickActions';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  country: string;
  currency: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  alt: string;
}

interface Order {
  orderId: string;
  date: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
  trackingNumber?: string;
}

const toDisplayOrder = (order: Order) => ({
  id: order.orderId,
  order_number: order.orderId,
  order_status: order.status,
  created_at: new Date(order.date).toISOString(),
  total: order.total,
  trackingNumber: order.trackingNumber,
  items: order.items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    image: item.image,
    alt: item.alt,
    total_price: item.price * item.quantity,
  })),
});

interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface SettingsData {
  newsletter: boolean;
  orderUpdates: boolean;
  promotions: boolean;
}

const DashboardInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'settings'>(
    'overview'
  );

  const [profile, setProfile] = useState<ProfileData>({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    currency: 'USD',
  });

  const [orders] = useState<Order[]>([
    {
      orderId: 'KMR-2026-001',
      date: 'January 10, 2026',
      items: [
        {
          id: '1',
          name: 'iPhone 15 Pro Max - 256GB Space Black',
          quantity: 1,
          price: 1199.0,
          image:
            'https://img.rocket.new/generatedImages/rocket_gen_img_169bd7559-1767283843614.png',
          alt: 'Black iPhone 15 Pro Max smartphone with triple camera system on white background',
        },
        {
          id: '2',
          name: 'MagSafe Leather Case - Midnight',
          quantity: 1,
          price: 59.0,
          image: 'https://images.unsplash.com/photo-1704695145210-2b78da5edc1f',
          alt: 'Black leather iPhone case with MagSafe compatibility on wooden surface',
        },
      ],

      total: 1258.0,
      currency: '$',
      status: 'delivered',
      trackingNumber: 'TRK123456789',
    },
    {
      orderId: 'KMR-2026-002',
      date: 'January 8, 2026',
      items: [
        {
          id: '3',
          name: 'AirPods Pro (2nd Generation)',
          quantity: 1,
          price: 249.0,
          image: 'https://images.unsplash.com/photo-1722040456443-c644d014d43f',
          alt: 'White AirPods Pro wireless earbuds with charging case on marble surface',
        },
      ],

      total: 249.0,
      currency: '$',
      status: 'shipped',
      trackingNumber: 'TRK987654321',
    },
    {
      orderId: 'KMR-2026-003',
      date: 'January 5, 2026',
      items: [
        {
          id: '4',
          name: 'USB-C to Lightning Cable - 2m',
          quantity: 2,
          price: 29.0,
          image:
            'https://img.rocket.new/generatedImages/rocket_gen_img_106b62446-1767441725928.png',
          alt: 'White USB-C to Lightning charging cable coiled on gray background',
        },
      ],

      total: 58.0,
      currency: '$',
      status: 'processing',
    },
  ]);

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Home',
      name: 'Sarah Johnson',
      street: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      isDefault: true,
    },
    {
      id: '2',
      label: 'Work',
      name: 'Sarah Johnson',
      street: '456 Business Ave, Suite 200',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      isDefault: false,
    },
  ]);

  const [settings, setSettings] = useState<SettingsData>({
    newsletter: true,
    orderUpdates: true,
    promotions: false,
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleProfileUpdate = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleReorder = (orderId: string) => {
    if (!isHydrated) return;
    alert(`Reordering items from order ${orderId}`);
  };

  const handleTrack = (trackingNumber: string) => {
    if (!isHydrated) return;
    alert(`Tracking order with number: ${trackingNumber}`);
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleEditAddress = (id: string) => {
    if (!isHydrated) return;
    alert(`Editing address ${id}`);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const handleAddNewAddress = () => {
    if (!isHydrated) return;
    alert('Opening add new address form');
  };

  const handleUpdateSettings = (newSettings: SettingsData) => {
    setSettings(newSettings);
  };

  const handleChangePassword = () => {
    if (!isHydrated) return;
    alert('Opening change password dialog');
  };

  const handleContinueShopping = () => {
    router.push('/home-product-showcase');
  };

  const handleViewOrders = () => {
    setActiveTab('orders');
  };

  const handleManageAddresses = () => {
    setActiveTab('addresses');
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-muted rounded-lg animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">
            My Account
          </h1>
          <p className="font-body text-muted-foreground">
            Manage your profile, orders, and preferences
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'orders', label: 'Order History' },
              { key: 'addresses', label: 'Addresses' },
              { key: 'settings', label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 rounded-lg font-body font-medium transition-smooth whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-accent text-accent-foreground elevation-2'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <QuickActions
              onContinueShopping={handleContinueShopping}
              onViewOrders={handleViewOrders}
              onManageAddresses={handleManageAddresses}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ProfileSection profile={profile} onUpdate={handleProfileUpdate} />

                <div className="bg-card rounded-lg elevation-2 p-6">
                  <h2 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Recent Orders
                  </h2>
                  <div className="space-y-4">
                    {orders.slice(0, 2).map((order) => (
                      <OrderHistoryCard
                        key={order.orderId}
                        order={toDisplayOrder(order)}
                        onReorder={handleReorder}
                        onTrack={handleTrack}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full mt-4 px-4 py-3 bg-muted text-foreground rounded-md transition-smooth hover:bg-muted/80 active:scale-97 font-body font-medium"
                  >
                    View All Orders
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <AccountSettings
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onChangePassword={handleChangePassword}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderHistoryCard
                key={order.orderId}
                order={toDisplayOrder(order)}
                onReorder={handleReorder}
                onTrack={handleTrack}
              />
            ))}
          </div>
        )}

        {activeTab === 'addresses' && (
          <AddressManagement
            addresses={addresses}
            onSetDefault={handleSetDefaultAddress}
            onEdit={handleEditAddress}
            onDelete={handleDeleteAddress}
            onAddNew={handleAddNewAddress}
          />
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <AccountSettings
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onChangePassword={handleChangePassword}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardInteractive;
