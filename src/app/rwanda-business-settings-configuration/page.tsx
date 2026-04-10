import type { Metadata } from 'next';
import AppHeader from '@/components/common/AppHeader';
import RwandaBusinessSettingsInteractive from './components/RwandaBusinessSettingsInteractive';

export const metadata: Metadata = {
  title: 'Rwanda Business Settings - Ka-ma-ro',
  description:
    'Configure location-specific operational parameters for the Rwandan market including business hours, language preferences, payment options, and address systems.',
};

export default function RwandaBusinessSettingsConfigurationPage() {
  return (
    <>
      <AppHeader />
      <main className="pt-16 min-h-screen bg-background">
        <RwandaBusinessSettingsInteractive />
      </main>
    </>
  );
}
