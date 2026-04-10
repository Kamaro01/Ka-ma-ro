'use client';
import { useSearchParams } from 'next/navigation';
import ProductEditorInteractive from './ProductEditorInteractive';

export default function ProductEditorWrapper() {
  const searchParams = useSearchParams();
  const productId = searchParams?.get('id') || undefined;

  return <ProductEditorInteractive productId={productId} />;
}
