import type { Metadata } from 'next';
import AppHeader from '@/components/common/AppHeader';
import DashboardInteractive from './components/DashboardInteractive';

export const metadata: Metadata = {
  title: 'My Account - Ka-ma-ro',
  description:
    'Manage your Ka-ma-ro account profile, view order history, update shipping addresses, and customize your notification preferences in one centralized dashboard.',
};

export default function UserAccountDashboardPage() {
  return (
    <>
      <AppHeader />
      <DashboardInteractive />
    </>
  );
}
