import React from 'react';
import AppHeader from '@/components/common/AppHeader';
import RequestAProductInteractive from './components/RequestAProductInteractive';

export default function RequestAProductPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <RequestAProductInteractive />
    </div>
  );
}
