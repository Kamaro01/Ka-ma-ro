import { supabase } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface PrivacySettings {
  email_marketing_enabled: boolean;
  data_sharing_enabled: boolean;
  profile_visibility: 'public' | 'private' | 'friends';
  two_factor_enabled: boolean;
  session_notifications: boolean;
  account_activity_alerts: boolean;
  notification_preferences?: Record<string, any>;
  preferred_contact_method?: string;
  preferred_language?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
}

export interface UpdatePrivacyRequest {
  email_marketing_enabled?: boolean;
  data_sharing_enabled?: boolean;
  profile_visibility?: 'public' | 'private' | 'friends';
  two_factor_enabled?: boolean;
  session_notifications?: boolean;
  account_activity_alerts?: boolean;
}

class UserProfileService {
  /**
   * Get current user profile
   */
  async getCurrentProfile(): Promise<{
    profile: UserProfile | null;
    error: string | null;
  }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { profile: null, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return { profile: null, error: 'Failed to fetch profile' };
      }

      return { profile: data, error: null };
    } catch (error) {
      console.error('Get profile error:', error);
      return { profile: null, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Update user profile information
   */
  async updateProfile(updates: UpdateProfileRequest): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, message: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, message: 'Failed to update profile' };
      }

      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'An unexpected error occurred' };
    }
  }

  /**
   * Get privacy settings
   */
  async getPrivacySettings(): Promise<{
    settings: PrivacySettings | null;
    error: string | null;
  }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { settings: null, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no preferences exist yet, return defaults
        if (error.code === 'PGRST116') {
          return {
            settings: {
              email_marketing_enabled: true,
              data_sharing_enabled: false,
              profile_visibility: 'private',
              two_factor_enabled: false,
              session_notifications: true,
              account_activity_alerts: true,
            },
            error: null,
          };
        }
        console.error('Error fetching privacy settings:', error);
        return { settings: null, error: 'Failed to fetch privacy settings' };
      }

      return { settings: data as PrivacySettings, error: null };
    } catch (error) {
      console.error('Get privacy settings error:', error);
      return { settings: null, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(updates: UpdatePrivacyRequest): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, message: 'Not authenticated' };
      }

      // Check if preferences exist
      const { data: existing } = await supabase
        .from('customer_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update existing preferences
        const { error } = await supabase
          .from('customer_preferences')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating privacy settings:', error);
          return { success: false, message: 'Failed to update privacy settings' };
        }
      } else {
        // Create new preferences
        const { error } = await supabase.from('customer_preferences').insert({
          user_id: user.id,
          ...updates,
        });

        if (error) {
          console.error('Error creating privacy settings:', error);
          return { success: false, message: 'Failed to create privacy settings' };
        }
      }

      return { success: true, message: 'Privacy settings updated successfully' };
    } catch (error) {
      console.error('Update privacy settings error:', error);
      return { success: false, message: 'An unexpected error occurred' };
    }
  }

  /**
   * Deactivate account
   */
  async deactivateAccount(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, message: 'Not authenticated' };
      }

      // Log the deactivation action
      try {
        await supabase.rpc('log_admin_action', {
          action_type: 'account_deactivation',
          resource_type: 'user_profiles',
          resource_id: user.id,
          details: { reason: 'User requested account deactivation' },
        });
      } catch (logError) {
        console.error('Error logging deactivation:', logError);
      }

      // Sign out the user
      await supabase.auth.signOut();

      return {
        success: true,
        message: 'Account deactivated successfully. You have been logged out.',
      };
    } catch (error) {
      console.error('Deactivate account error:', error);
      return { success: false, message: 'An unexpected error occurred' };
    }
  }
}

export const userProfileService = new UserProfileService();
