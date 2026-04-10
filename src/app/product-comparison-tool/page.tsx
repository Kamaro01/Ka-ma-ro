import { Metadata } from 'next';
import { Suspense } from 'react';
import ProductComparisonInteractive from './components/ProductComparisonInteractive';

export const metadata: Metadata = {
  title: 'Product Comparison Tool - Ka-ma-ro',
  description:
    'Compare multiple smartphones and accessories side-by-side to make informed purchasing decisions. Compare specs, prices, ratings, and features.',
  keywords:
    'product comparison, smartphone comparison, compare phones, compare accessories, Ka-ma-ro comparison',
};

export default function ProductComparisonToolPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <ProductComparisonInteractive />
      </Suspense>
    </main>
  );
}
