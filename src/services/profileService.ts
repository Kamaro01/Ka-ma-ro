import { supabase } from '../lib/supabase/client';

interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  email?: string;
}

interface UpdatePrivacyPreferencesData {
  notificationPreferences?: {
    email?: boolean;
    sms?: boolean;
    marketing?: boolean;
  };
  preferredContactMethod?: string;
  preferredLanguage?: string;
  dataSharing?: boolean;
}

export interface ProfileService {
  updateProfile: (
    userId: string,
    data: UpdateProfileData
  ) => Promise<{
    success: boolean;
    error: string | null;
  }>;
  updatePrivacyPreferences: (
    userId: string,
    preferences: UpdatePrivacyPreferencesData
  ) => Promise<{
    success: boolean;
    error: string | null;
  }>;
  getPrivacyPreferences: (userId: string) => Promise<{
    preferences: UpdatePrivacyPreferencesData | null;
    error: string | null;
  }>;
  deactivateAccount: (
    userId: string,
    reason?: string
  ) => Promise<{
    success: boolean;
    error: string | null;
  }>;
}

export const profileService: ProfileService = {
  async updateProfile(userId: string, data: UpdateProfileData) {
    try {
      const updateData: any = {};
      if (data.fullName !== undefined) updateData.full_name = data.fullName;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.email !== undefined) updateData.email = data.email;

      const { error } = await supabase.from('user_profiles').update(updateData).eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update profile',
      };
    }
  },

  async updatePrivacyPreferences(userId: string, preferences: UpdatePrivacyPreferencesData) {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      const updateData: any = {};

      if (preferences.notificationPreferences) {
        updateData.notification_preferences = {
          ...existing?.notification_preferences,
          ...preferences.notificationPreferences,
        };
      }

      if (preferences.preferredContactMethod !== undefined) {
        updateData.preferred_contact_method = preferences.preferredContactMethod;
      }

      if (preferences.preferredLanguage !== undefined) {
        updateData.preferred_language = preferences.preferredLanguage;
      }

      if (existing) {
        const { error } = await supabase
          .from('customer_preferences')
          .update(updateData)
          .eq('user_id', userId);

        if (error) {
          return { success: false, error: error.message };
        }
      } else {
        const { error } = await supabase
          .from('customer_preferences')
          .insert({ user_id: userId, ...updateData });

        if (error) {
          return { success: false, error: error.message };
        }
      }

      return { success: true, error: null };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update privacy preferences',
      };
    }
  },

  async getPrivacyPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        return { preferences: null, error: error.message };
      }

      const preferences: UpdatePrivacyPreferencesData = {
        notificationPreferences: data?.notification_preferences,
        preferredContactMethod: data?.preferred_contact_method,
        preferredLanguage: data?.preferred_language,
      };

      return { preferences, error: null };
    } catch (err) {
      return {
        preferences: null,
        error: err instanceof Error ? err.message : 'Failed to fetch privacy preferences',
      };
    }
  },

  async deactivateAccount(userId: string, reason?: string) {
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        return { success: false, error: authError.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to deactivate account',
      };
    }
  },
};
