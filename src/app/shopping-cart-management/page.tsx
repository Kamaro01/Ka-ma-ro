import type { Metadata } from 'next';
import AppHeader from '@/components/common/AppHeader';
import ShoppingCartInteractive from './components/ShoppingCartInteractive';

export const metadata: Metadata = {
  title: 'Shopping Cart - Ka-ma-ro',
  description:
    'Review and manage items in your shopping cart. Update quantities, remove items, and proceed to secure checkout for your electronics and accessories.',
};

export default function ShoppingCartPage() {
  return (
    <>
      <AppHeader />
      <ShoppingCartInteractive />
    </>
  );
}
