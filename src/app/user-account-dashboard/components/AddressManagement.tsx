'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface AddressManagementProps {
  addresses: Address[];
  onSetDefault: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const AddressManagement = ({
  addresses,
  onSetDefault,
  onEdit,
  onDelete,
  onAddNew,
}: AddressManagementProps) => {
  return (
    <div className="bg-card rounded-lg elevation-2 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground">Shipping Addresses</h2>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-md transition-smooth hover:opacity-90 active:scale-97 caption font-medium flex items-center gap-2"
        >
          <Icon name="PlusIcon" size={16} />
          Add New
        </button>
      </div>

      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`p-4 rounded-lg border-2 transition-smooth ${
              address.isDefault
                ? 'border-accent bg-accent/5'
                : 'border-border bg-background hover:border-accent/50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="MapPinIcon" size={20} className="text-accent" />
                <h3 className="font-body font-semibold text-foreground">{address.label}</h3>
                {address.isDefault && (
                  <span className="px-2 py-0.5 bg-accent text-accent-foreground rounded-full caption font-medium">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(address.id)}
                  className="touch-target flex items-center justify-center transition-smooth hover:bg-muted rounded-md active:scale-97"
                  aria-label="Edit address"
                >
                  <Icon name="PencilIcon" size={18} className="text-accent" />
                </button>
                <button
                  onClick={() => onDelete(address.id)}
                  className="touch-target flex items-center justify-center transition-smooth hover:bg-error/10 rounded-md active:scale-97"
                  aria-label="Delete address"
                >
                  <Icon name="TrashIcon" size={18} className="text-error" />
                </button>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              <p className="font-body text-foreground">{address.name}</p>
              <p className="caption text-muted-foreground">{address.street}</p>
              <p className="caption text-muted-foreground">
                {address.city}, {address.state} {address.zipCode}
              </p>
              <p className="caption text-muted-foreground">{address.country}</p>
              <p className="caption text-muted-foreground flex items-center gap-2">
                <Icon name="PhoneIcon" size={14} />
                {address.phone}
              </p>
            </div>

            {!address.isDefault && (
              <button
                onClick={() => onSetDefault(address.id)}
                className="w-full px-4 py-2 bg-muted text-foreground rounded-md transition-smooth hover:bg-muted/80 active:scale-97 caption font-medium"
              >
                Set as Default
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressManagement;
