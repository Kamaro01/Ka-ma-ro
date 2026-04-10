'use client';

import AppHeader from '@/components/common/AppHeader';
import AdminOrdersInteractive from './components/AdminOrdersInteractive';

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <AdminOrdersInteractive />
    </div>
  );
}
