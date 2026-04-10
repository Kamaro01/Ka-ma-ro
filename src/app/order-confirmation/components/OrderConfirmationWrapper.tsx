'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderConfirmationInteractive from './OrderConfirmationInteractive';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get('order');

  return <OrderConfirmationInteractive orderNumber={orderNumber} />;
}

export default function OrderConfirmationWrapper() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-pulse">Loading order details...</div>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
