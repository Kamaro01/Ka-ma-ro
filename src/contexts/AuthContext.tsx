'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import type { Database } from '../types/database.types';

type AuthProfile = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: string | null;
  createdAt: string;
  updatedAt: string;
};

type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'customer' | 'admin';
};

type AuthContextValue = {
  user: User | null;
  profile: AuthProfile | null;
  userProfile: AuthProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (input: SignUpInput) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  isAdmin: () => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = supabase.auth;

  const fetchProfile = async (userId: string): Promise<AuthProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile may not exist yet (trigger delay), return null gracefully
        console.warn('Profile fetch warning:', error?.message);
        return null;
      }

      const row = data as Database['public']['Tables']['user_profiles']['Row'] | null;

      return row
        ? {
            id: row.id,
            email: row.email,
            fullName: row.full_name,
            phone: row.phone,
            role: row.role,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }
        : null;
    } catch (err) {
      console.error('fetchProfile error:', err);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await auth.getSession();

        if (session?.user) {
          setUser(session?.user);
          const userProfile = await fetchProfile(session?.user?.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Session init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        // Small delay for trigger to create profile on SIGNED_IN after signup
        if (event === 'SIGNED_IN') {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        const userProfile = await fetchProfile(session?.user?.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await auth.signInWithPassword({ email, password });

      if (error) {
        return { error: error?.message };
      }

      if (data?.user) {
        const userProfile = await fetchProfile(data?.user?.id);
        setProfile(userProfile);
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err?.message : 'Sign in failed' };
    }
  };

  const signUp = async ({ email, password, fullName, phone, role = 'customer' }: SignUpInput) => {
    try {
      const { data, error } = await auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
            role,
          },
        },
      });

      if (error) {
        return { error: error?.message };
      }

      // If email confirmation is disabled, user is immediately active
      if (data?.user && data?.session) {
        // Wait for trigger to create profile
        await new Promise((resolve) => setTimeout(resolve, 800));
        const userProfile = await fetchProfile(data?.user?.id);
        setProfile(userProfile);
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err?.message : 'Sign up failed' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await auth.signOut();
      if (!error) {
        setUser(null);
        setProfile(null);
      }
      return { error: error ? error?.message : null };
    } catch (err) {
      return { error: err instanceof Error ? err?.message : 'Sign out failed' };
    }
  };

  const isAdmin = () => profile?.role === 'admin';

  const value = {
    user,
    profile,
    userProfile: profile,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
