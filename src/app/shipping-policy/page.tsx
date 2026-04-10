import type { Metadata } from 'next';
import AppHeader from '@/components/common/AppHeader';
import ShippingPolicyInteractive from './components/ShippingPolicyInteractive';

export const metadata: Metadata = {
  title: 'Shipping Policy - Ka-ma-ro',
  description:
    'Learn about Ka-ma-ro shipping options, delivery times, international shipping procedures, and tracking information for your electronics orders.',
};

export default function ShippingPolicyPage() {
  return (
    <>
      <AppHeader />
      <ShippingPolicyInteractive />
    </>
  );
}
