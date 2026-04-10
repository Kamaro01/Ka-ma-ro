'use client';

import { WishlistItemWithProduct } from '@/types/models';
import WishlistCard from './WishlistCard';

interface WishlistGridProps {
  items: WishlistItemWithProduct[];
  onRemove: (itemId: string) => void;
  onMoveToCart: (itemId: string) => void;
  onUpdatePriority: (itemId: string, priority: number) => void;
  onSetPriceAlert: (itemId: string, targetPrice: number) => void;
}

export default function WishlistGrid({
  items,
  onRemove,
  onMoveToCart,
  onUpdatePriority,
  onSetPriceAlert,
}: WishlistGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items?.map((item) => (
        <WishlistCard
          key={item?.id}
          item={item}
          onRemove={onRemove}
          onMoveToCart={onMoveToCart}
          onUpdatePriority={onUpdatePriority}
          onSetPriceAlert={onSetPriceAlert}
        />
      ))}
    </div>
  );
}
