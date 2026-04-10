'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface QuickActionsProps {
  onContinueShopping: () => void;
  onViewOrders: () => void;
  onManageAddresses: () => void;
}

const QuickActions = ({
  onContinueShopping,
  onViewOrders,
  onManageAddresses,
}: QuickActionsProps) => {
  const actions = [
    {
      label: 'Continue Shopping',
      description: 'Browse our latest products',
      icon: 'ShoppingBagIcon',
      onClick: onContinueShopping,
      color: 'bg-accent text-accent-foreground',
    },
    {
      label: 'View All Orders',
      description: 'Track your purchases',
      icon: 'ClipboardDocumentListIcon',
      onClick: onViewOrders,
      color: 'bg-muted text-foreground',
    },
    {
      label: 'Manage Addresses',
      description: 'Update shipping info',
      icon: 'MapPinIcon',
      onClick: onManageAddresses,
      color: 'bg-muted text-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={`p-6 rounded-lg ${action.color} transition-smooth hover:opacity-90 active:scale-97 elevation-2 text-left`}
        >
          <Icon name={action.icon as any} size={32} className="mb-4" />
          <h3 className="font-heading font-semibold text-lg mb-1">{action.label}</h3>
          <p className="caption opacity-80">{action.description}</p>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
