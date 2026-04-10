'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { authService } from '@/services/authService';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  country: string;
  currency: string;
}

interface ProfileSectionProps {
  profile: ProfileData;
  onUpdate: (field: keyof ProfileData, value: string) => void;
}

const ProfileSection = ({ profile, onUpdate }: ProfileSectionProps) => {
  const [editingField, setEditingField] = useState<keyof ProfileData | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const startEdit = (field: keyof ProfileData) => {
    setEditingField(field);
    setTempValue(profile[field]);
  };

  const saveEdit = () => {
    if (editingField) {
      onUpdate(editingField, tempValue);
      setEditingField(null);
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const fields: { key: keyof ProfileData; label: string; icon: string }[] = [
    { key: 'name', label: 'Full Name', icon: 'UserIcon' },
    { key: 'email', label: 'Email Address', icon: 'EnvelopeIcon' },
    { key: 'phone', label: 'Phone Number', icon: 'PhoneIcon' },
    { key: 'country', label: 'Country', icon: 'GlobeAltIcon' },
    { key: 'currency', label: 'Preferred Currency', icon: 'CurrencyDollarIcon' },
  ];

  return (
    <div className="bg-card rounded-lg elevation-2 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground">Profile Information</h2>
        <Icon name="UserCircleIcon" size={24} className="text-accent" />
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div
            key={field.key}
            className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
          >
            <div className="flex items-center gap-3 flex-1">
              <Icon name={field.icon as any} size={20} className="text-muted-foreground" />
              <div className="flex-1">
                <p className="caption text-muted-foreground mb-1">{field.label}</p>
                {editingField === field.key ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    autoFocus
                  />
                ) : (
                  <p className="font-body text-foreground">{profile[field.key]}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {editingField === field.key ? (
                <>
                  <button
                    onClick={saveEdit}
                    className="touch-target flex items-center justify-center transition-smooth hover:bg-success/10 rounded-md active:scale-97"
                    aria-label="Save changes"
                  >
                    <Icon name="CheckIcon" size={20} className="text-success" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="touch-target flex items-center justify-center transition-smooth hover:bg-error/10 rounded-md active:scale-97"
                    aria-label="Cancel editing"
                  >
                    <Icon name="XMarkIcon" size={20} className="text-error" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startEdit(field.key)}
                  className="touch-target flex items-center justify-center transition-smooth hover:bg-muted rounded-md active:scale-97"
                  aria-label={`Edit ${field.label}`}
                >
                  <Icon name="PencilIcon" size={20} className="text-accent" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-muted">
        <button
          onClick={() => setShowPasswordReset(!showPasswordReset)}
          className="text-accent hover:text-accent/80 text-sm font-medium transition-smooth"
        >
          {showPasswordReset ? 'Cancel Password Reset' : 'Reset Password'}
        </button>

        {showPasswordReset && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              A password reset link will be sent to your email address.
            </p>
            <button
              onClick={async () => {
                const result = await authService.resetPassword(profile.email);
                if (result.success) {
                  alert('Password reset email sent! Please check your inbox.');
                  setShowPasswordReset(false);
                } else {
                  alert('Failed to send reset email: ' + result.error);
                }
              }}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-smooth"
            >
              Send Reset Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
