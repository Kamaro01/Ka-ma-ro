import type { Metadata } from 'next';
import AppHeader from '@/components/common/AppHeader';
import DigitalAccessibilityInteractive from './components/DigitalAccessibilityInteractive';

export const metadata: Metadata = {
  title: 'Digital Accessibility Center - Ka-ma-ro',
  description:
    'Comprehensive accessibility features and tools to ensure inclusive shopping experiences for all customers with text adjustment, screen reader optimization, voice commands, and visual assistance.',
};

export default function DigitalAccessibilityCenterPage() {
  return (
    <>
      <AppHeader />
      <main className="pt-16 min-h-screen bg-background">
        <DigitalAccessibilityInteractive />
      </main>
    </>
  );
}
