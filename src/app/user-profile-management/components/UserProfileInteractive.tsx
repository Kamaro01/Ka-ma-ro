'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import {
  userProfileService,
  type UserProfile,
  type PrivacySettings,
  type UpdateProfileRequest,
  type UpdatePrivacyRequest,
} from '@/services/userProfileService';

type TabType = 'profile' | 'privacy' | 'security';

const UserProfileInteractive = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState<UpdateProfileRequest>({});

  // Privacy state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [privacyForm, setPrivacyForm] = useState<UpdatePrivacyRequest>({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    // Load profile
    const profileResult = await userProfileService.getCurrentProfile();
    if (profileResult.error) {
      setError(profileResult.error);
    } else if (profileResult.profile) {
      setProfile(profileResult.profile);
      setProfileForm({
        full_name: profileResult.profile.full_name,
        phone: profileResult.profile.phone || '',
      });
    }

    // Load privacy settings
    const privacyResult = await userProfileService.getPrivacySettings();
    if (privacyResult.error) {
      setError(privacyResult.error);
    } else if (privacyResult.settings) {
      setPrivacySettings(privacyResult.settings);
      setPrivacyForm({
        email_marketing_enabled: privacyResult.settings.email_marketing_enabled,
        data_sharing_enabled: privacyResult.settings.data_sharing_enabled,
        profile_visibility: privacyResult.settings.profile_visibility,
        two_factor_enabled: privacyResult.settings.two_factor_enabled,
        session_notifications: privacyResult.settings.session_notifications,
        account_activity_alerts: privacyResult.settings.account_activity_alerts,
      });
    }

    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    const result = await userProfileService.updateProfile(profileForm);

    if (result.success) {
      setSuccessMessage('Profile updated successfully');
      await loadData();
    } else {
      setError(result.message);
    }

    setSaving(false);
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    const result = await userProfileService.updatePrivacySettings(privacyForm);

    if (result.success) {
      setSuccessMessage('Privacy settings updated successfully');
      await loadData();
    } else {
      setError(result.message);
    }

    setSaving(false);
  };

  const handleDeactivateAccount = async () => {
    setShowDeactivateModal(false);
    setSaving(true);
    setError('');

    const result = await userProfileService.deactivateAccount();

    if (result.success) {
      router.push('/login');
    } else {
      setError(result.message);
    }

    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
            Account Management
          </h1>
          <p className="text-muted-foreground">
            Manage your profile, privacy settings, and account security
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Icon
              name="CheckCircleIcon"
              size={20}
              className="text-green-600 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <Icon
              name="ExclamationCircleIcon"
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-card rounded-lg elevation-1 overflow-hidden">
          <div className="border-b border-border">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'text-accent border-b-2 border-accent bg-accent/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon name="UserCircleIcon" size={20} />
                  Profile
                </div>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'privacy'
                    ? 'text-accent border-b-2 border-accent bg-accent/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon name="ShieldCheckIcon" size={20} />
                  Privacy
                </div>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'security'
                    ? 'text-accent border-b-2 border-accent bg-accent/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon name="LockClosedIcon" size={20} />
                  Security
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-border rounded-lg bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={profileForm.full_name || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                    placeholder="Enter your full name"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={profileForm.phone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                    placeholder="Enter your phone number"
                    disabled={saving}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-accent text-white py-3 px-8 rounded-lg font-semibold transition-smooth hover:bg-accent/90 active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                {/* Email Marketing */}
                <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-foreground mb-1">Email Marketing</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails about new products, special offers, and updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyForm.email_marketing_enabled}
                      onChange={(e) =>
                        setPrivacyForm({
                          ...privacyForm,
                          email_marketing_enabled: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                      disabled={saving}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>

                {/* Data Sharing */}
                <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-foreground mb-1">Data Sharing</h3>
                    <p className="text-sm text-muted-foreground">
                      Allow sharing of anonymized data with partners to improve services and
                      recommendations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyForm.data_sharing_enabled}
                      onChange={(e) =>
                        setPrivacyForm({ ...privacyForm, data_sharing_enabled: e.target.checked })
                      }
                      className="sr-only peer"
                      disabled={saving}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>

                {/* Profile Visibility */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Profile Visibility</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Control who can see your profile information
                  </p>
                  <select
                    value={privacyForm.profile_visibility}
                    onChange={(e) =>
                      setPrivacyForm({
                        ...privacyForm,
                        profile_visibility: e.target.value as 'public' | 'private' | 'friends',
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                    disabled={saving}
                  >
                    <option value="private">Private - Only visible to you</option>
                    <option value="friends">Friends - Visible to connected users</option>
                    <option value="public">Public - Visible to everyone</option>
                  </select>
                </div>

                {/* Session Notifications */}
                <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-foreground mb-1">Session Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new login sessions on your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyForm.session_notifications}
                      onChange={(e) =>
                        setPrivacyForm({ ...privacyForm, session_notifications: e.target.checked })
                      }
                      className="sr-only peer"
                      disabled={saving}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>

                {/* Account Activity Alerts */}
                <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-foreground mb-1">Account Activity Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts about important account activities and security updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyForm.account_activity_alerts}
                      onChange={(e) =>
                        setPrivacyForm({
                          ...privacyForm,
                          account_activity_alerts: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                      disabled={saving}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSavePrivacy}
                    disabled={saving}
                    className="bg-accent text-white py-3 px-8 rounded-lg font-semibold transition-smooth hover:bg-accent/90 active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Privacy Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Change Password</h3>
                      <p className="text-sm text-muted-foreground">Update your account password</p>
                    </div>
                    <button
                      onClick={() => router.push('/password-reset-portal')}
                      className="bg-muted hover:bg-muted/80 text-foreground py-2 px-4 rounded-lg font-medium transition-smooth active:scale-97"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-foreground mb-1">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Add an extra layer of security to your account
                      </p>
                      {privacyForm.two_factor_enabled ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          <Icon name="CheckCircleIcon" size={14} />
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                          <Icon name="XCircleIcon" size={14} />
                          Disabled
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setPrivacyForm({
                          ...privacyForm,
                          two_factor_enabled: !privacyForm.two_factor_enabled,
                        })
                      }
                      disabled={saving}
                      className="bg-muted hover:bg-muted/80 text-foreground py-2 px-4 rounded-lg font-medium transition-smooth active:scale-97 disabled:opacity-50"
                    >
                      {privacyForm.two_factor_enabled ? 'Disable' : 'Enable'} 2FA
                    </button>
                  </div>
                </div>

                {/* Sign Out */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Sign Out</h3>
                      <p className="text-sm text-muted-foreground">
                        Sign out from your current session
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="bg-muted hover:bg-muted/80 text-foreground py-2 px-4 rounded-lg font-medium transition-smooth active:scale-97"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Deactivate Account */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-red-900 mb-1">Deactivate Account</h3>
                      <p className="text-sm text-red-700">
                        Permanently deactivate your account. This action cannot be undone.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeactivateModal(true)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-smooth active:scale-97"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>

                {privacyForm.two_factor_enabled !== privacySettings?.two_factor_enabled && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleSavePrivacy}
                      disabled={saving}
                      className="bg-accent text-white py-3 px-8 rounded-lg font-semibold transition-smooth hover:bg-accent/90 active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Security Settings'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deactivation Modal */}
      {showDeactivateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowDeactivateModal(false)}
        >
          <div
            className="bg-card rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="ExclamationTriangleIcon" size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                  Deactivate Account
                </h3>
                <p className="text-muted-foreground text-sm">
                  Are you sure you want to deactivate your account? This action cannot be undone and
                  you will lose access to all your data.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="bg-muted hover:bg-muted/80 text-foreground py-2 px-6 rounded-lg font-medium transition-smooth active:scale-97"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateAccount}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg font-medium transition-smooth active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileInteractive;
