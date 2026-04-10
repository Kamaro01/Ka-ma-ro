import type { Metadata } from 'next';
import AppHeader from '@/components/common/AppHeader';
import PromotionalCampaignInteractive from './components/PromotionalCampaignInteractive';

export const metadata: Metadata = {
  title: 'Promotional Campaign Management - Ka-ma-ro',
  description:
    'Create, schedule, and monitor marketing campaigns with comprehensive discount and promotional tools.',
};

export default function PromotionalCampaignManagementPage() {
  return (
    <>
      <AppHeader />
      <main className="pt-16 min-h-screen bg-background">
        <PromotionalCampaignInteractive />
      </main>
    </>
  );
}
