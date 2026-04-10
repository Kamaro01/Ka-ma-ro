import type { Metadata } from 'next';
import AppHeader from '@/components/common/AppHeader';
import ProductCategoryInteractive from './components/ProductCategoryInteractive';

export const metadata: Metadata = {
  title: 'Product Categories - Ka-ma-ro',
  description:
    'Browse our collection of premium smartphones and accessories. Filter by category, search for specific products, and find the perfect device or accessory for your needs.',
};

export default function ProductCategoryListingPage() {
  return (
    <>
      <AppHeader />
      <ProductCategoryInteractive />
    </>
  );
}
