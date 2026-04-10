'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface SettingsData {
  newsletter: boolean;
  orderUpdates: boolean;
  promotions: boolean;
}

interface AccountSettingsProps {
  settings?: SettingsData;
  onUpdateSettings?: (newSettings: SettingsData) => void;
  onChangePassword?: () => void;
}

type NotificationPreferences = {
  email: boolean;
  sms: boolean;
  marketing: boolean;
};

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  email: true,
  sms: false,
  marketing: false,
};

const AccountSettings = ({
  settings,
  onUpdateSettings,
  onChangePassword,
}: AccountSettingsProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const [preferredContactMethod, setPreferredContactMethod] = useState('email');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');

  useEffect(() => {
    const loadPreferences = async () => {
      if (user?.id) {
        const { preferences } = await profileService.getPrivacyPreferences(user.id);
        if (preferences) {
          setNotificationPreferences({
            ...DEFAULT_NOTIFICATIONS,
            ...(preferences?.notificationPreferences || {}),
          });
          setPreferredContactMethod(preferences?.preferredContactMethod || 'email');
          setPreferredLanguage(preferences?.preferredLanguage || 'en');
        }
      }
    };
    loadPreferences();
  }, [user]);

  const handleSavePreferences = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    const { success, error } = await profileService.updatePrivacyPreferences(user.id, {
      notificationPreferences,
      preferredContactMethod,
      preferredLanguage,
    });

    setIsSaving(false);

    if (success) {
      onUpdateSettings?.({
        newsletter: notificationPreferences.marketing,
        orderUpdates: notificationPreferences.email || notificationPreferences.sms,
        promotions: notificationPreferences.marketing,
      });
      alert('Privacy preferences updated successfully!');
    } else {
      alert('Failed to update preferences: ' + error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await authService.signOut();
    if (!error) {
      router.push('/login');
    }
  };

  const handlePasswordChange = () => {
    if (onChangePassword) {
      onChangePassword();
      return;
    }

    router.push('/reset-password');
  };

  const handleDeactivateAccount = async () => {
    if (!user?.id) return;

    const confirmed = confirm(
      'Are you sure you want to deactivate your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    const { success, error } = await profileService.deactivateAccount(user.id, deactivateReason);

    if (success) {
      alert('Your account has been deactivated.');
      await authService.signOut();
      router.push('/');
    } else {
      alert('Failed to deactivate account: ' + error);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 elevation-1 space-y-6">
      <div>
        <h2 className="font-heading font-bold text-xl text-foreground mb-4">
          Privacy & Preferences
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-3">Notification Preferences</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationPreferences?.email}
                  onChange={(e) =>
                    setNotificationPreferences({
                      ...notificationPreferences,
                      email: e?.target?.checked,
                    })
                  }
                  className="w-4 h-4 text-accent rounded focus:ring-accent"
                />
                <span className="text-sm text-foreground">Email notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationPreferences?.sms}
                  onChange={(e) =>
                    setNotificationPreferences({
                      ...notificationPreferences,
                      sms: e?.target?.checked,
                    })
                  }
                  className="w-4 h-4 text-accent rounded focus:ring-accent"
                />
                <span className="text-sm text-foreground">SMS notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationPreferences?.marketing}
                  onChange={(e) =>
                    setNotificationPreferences({
                      ...notificationPreferences,
                      marketing: e?.target?.checked,
                    })
                  }
                  className="w-4 h-4 text-accent rounded focus:ring-accent"
                />
                <span className="text-sm text-foreground">Marketing communications</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-foreground mb-3">Contact Preferences</h3>
            <select
              value={preferredContactMethod}
              onChange={(e) => setPreferredContactMethod(e?.target?.value)}
              className="w-full px-3 py-2 border border-muted rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-foreground mb-3">Language</h3>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e?.target?.value)}
              className="w-full px-3 py-2 border border-muted rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="en">English</option>
              <option value="rw">Kinyarwanda</option>
              <option value="fr">French</option>
            </select>
          </div>

          <button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
      <div className="border-t border-muted pt-6">
        <h2 className="font-heading font-bold text-xl text-foreground mb-4">Account Actions</h2>

        <div className="space-y-3">
          {settings && (
            <div className="p-3 bg-muted/40 rounded-lg text-sm text-muted-foreground">
              Newsletter: {settings.newsletter ? 'On' : 'Off'} | Order updates:{' '}
              {settings.orderUpdates ? 'On' : 'Off'} | Promotions:{' '}
              {settings.promotions ? 'On' : 'Off'}
            </div>
          )}
          <button
            onClick={handlePasswordChange}
            className="w-full px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-smooth"
          >
            Change Password
          </button>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-smooth"
          >
            Sign Out
          </button>

          <button
            onClick={() => setShowDeactivateConfirm(!showDeactivateConfirm)}
            className="w-full px-4 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-smooth"
          >
            Deactivate Account
          </button>

          {showDeactivateConfirm && (
            <div className="mt-4 p-4 bg-error/10 rounded-lg space-y-3">
              <p className="text-sm text-error font-medium">
                This action is permanent and cannot be undone.
              </p>
              <textarea
                placeholder="Reason for deactivation (optional)"
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e?.target?.value)}
                className="w-full px-3 py-2 border border-error rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-error resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDeactivateAccount}
                  className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-smooth"
                >
                  Confirm Deactivation
                </button>
                <button
                  onClick={() => setShowDeactivateConfirm(false)}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-smooth"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
