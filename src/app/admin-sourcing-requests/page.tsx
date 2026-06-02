import React from 'react';
import AppHeader from '@/components/common/AppHeader';
import AdminSourcingRequestsInteractive from './components/AdminSourcingRequestsInteractive';

export default function AdminSourcingRequestsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <AdminSourcingRequestsInteractive />
    </div>
  );
}
