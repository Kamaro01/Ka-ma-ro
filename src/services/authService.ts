import { supabase } from '../lib/supabase/client';
import { UserProfile } from '../types/models';
import { Database } from '../types/database.types';

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];

export interface SignInResponse {
  user: any;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'customer' | 'admin' | 'super_admin';
}

export interface SignUpResponse {
  user: any;
  error: string | null;
}

export interface UserProfileResponse {
  profile: UserProfile | null;
  error: string | null;
}

export const authService = {
  async signIn(email: string, password: string): Promise<SignInResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data.user, error: null };
    } catch (err) {
      return {
        user: null,
        error: err instanceof Error ? err.message : 'An error occurred during sign in',
      };
    }
  },

  async signUp(signUpData: SignUpData): Promise<SignUpResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName,
            phone: signUpData.phone || null,
            role: signUpData.role || 'customer',
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data.user, error: null };
    } catch (err) {
      return {
        user: null,
        error: err instanceof Error ? err.message : 'An error occurred during sign up',
      };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'An error occurred during sign out',
      };
    }
  },

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        return { session: null, error: error.message };
      }
      return { session: data.session, error: null };
    } catch (err) {
      return {
        session: null,
        error: err instanceof Error ? err.message : 'An error occurred',
      };
    }
  },

  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { profile: null, error: error.message };
      }

      const row = data as UserProfileRow;
      const profile: UserProfile = {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        phone: row.phone,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      return { profile, error: null };
    } catch (err) {
      return {
        profile: null,
        error: err instanceof Error ? err.message : 'Failed to fetch user profile',
      };
    }
  },

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to send password reset email',
      };
    }
  },

  async updatePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update password',
      };
    }
  },
};
