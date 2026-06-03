import React, { Suspense } from 'react';
import AppHeader from '@/components/common/AppHeader';
import RequestAProductInteractive from './components/RequestAProductInteractive';

export default function RequestAProductPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <Suspense
        fallback={
          <div className="max-w-5xl mx-auto px-4 py-16 text-center text-sm text-slate-600">
            Loading request form...
          </div>
        }
      >
        <RequestAProductInteractive />
      </Suspense>
    </div>
  );
}
