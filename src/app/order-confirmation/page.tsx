'use client';

import React from 'react';
import AppHeader from '@/components/common/AppHeader';
import OrderConfirmationWrapper from './components/OrderConfirmationWrapper';

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <OrderConfirmationWrapper />
    </div>
  );
}
