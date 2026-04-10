'use client';

import React from 'react';
import AppHeader from '@/components/common/AppHeader';
import PaymentProcessingInteractive from './components/PaymentProcessingInteractive';

export default function PaymentProcessingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <PaymentProcessingInteractive />
    </div>
  );
}
