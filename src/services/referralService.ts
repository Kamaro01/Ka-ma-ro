import { supabase } from '@/lib/supabase/client';
import { Referral, ReferralStatus } from '@/types/models';

interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  successfulReferrals: number;
  totalPointsEarned: number;
  recentReferrals: Referral[];
}

interface CreateReferralInput {
  referrerId: string;
  refereeEmail: string;
}

const mapReferralRow = (row: any): Referral => ({
  id: row.id,
  referrerId: row.referrer_id,
  refereeId: row.referee_id,
  refereeEmail: row.referee_email,
  referralCode: row.referral_code,
  referralStatus: row.referral_status as ReferralStatus,
  status: row.referral_status as ReferralStatus,
  signupDate: row.signup_date,
  firstPurchaseDate: row.first_purchase_date,
  referrerPointsEarned: row.referrer_points_earned,
  refereePointsEarned: row.referee_points_earned,
  pointsAwarded: row.referrer_points_earned,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const referralService = {
  // Create new referral
  async createReferral(input: CreateReferralInput): Promise<ServiceResponse<Referral>> {
    try {
      // Generate unique referral code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_referral_code', {
        p_user_id: input.referrerId,
      });

      if (codeError) throw codeError;

      const { data, error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: input.referrerId,
          referee_email: input.refereeEmail,
          referral_code: codeData,
          referral_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: mapReferralRow(data),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to create referral'),
      };
    }
  },

  // Get user's referrals (as referrer)
  async getUserReferrals(userId: string): Promise<ServiceResponse<Referral[]>> {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: (data || []).map((row: any) => mapReferralRow(row)),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch referrals'),
      };
    }
  },

  // Get referral statistics
  async getReferralStats(userId: string): Promise<ServiceResponse<ReferralStats>> {
    try {
      const { data, error } = await this.getUserReferrals(userId);

      if (error) throw error;

      const referrals = data || [];
      const stats: ReferralStats = {
        totalReferrals: referrals.length,
        pendingReferrals: referrals.filter((r) => r.referralStatus === 'pending').length,
        successfulReferrals: referrals.filter(
          (r) => r.referralStatus === 'first_purchase_complete' || r.referralStatus === 'active'
        ).length,
        totalPointsEarned: referrals.reduce((sum, r) => sum + r.referrerPointsEarned, 0),
        recentReferrals: referrals.slice(0, 5),
      };

      return { data: stats, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch referral stats'),
      };
    }
  },

  // Get referral by code
  async getReferralByCode(code: string): Promise<ServiceResponse<Referral>> {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referral_code', code)
        .single();

      if (error) throw error;

      return {
        data: mapReferralRow(data),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch referral'),
      };
    }
  },

  // Generate shareable referral link
  generateReferralLink(referralCode: string): string {
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || 'https://ka-ma-ro.com';

    return `${baseUrl}/register?ref=${referralCode}`;
  },

  // Generate social share text
  generateShareText(referralCode: string): {
    twitter: string;
    facebook: string;
    instagram: string;
    email: string;
  } {
    const link = this.generateReferralLink(referralCode);
    const baseMessage = 'Join Ka-ma-ro and earn rewards on your first purchase!';

    return {
      twitter: `${baseMessage} Use my referral link: ${link} #KaMaRo #Rewards`,
      facebook: `${baseMessage}\n\nUse my referral link to get started:\n${link}`,
      instagram: `${baseMessage}\n\nLink in bio or DM me for my referral code: ${referralCode}`,
      email: `Subject: Join Ka-ma-ro with my referral!\n\nHi!\n\n${baseMessage}\n\nClick here to sign up: ${link}\n\nHappy shopping!\n`,
    };
  },

  async generateReferralCode(userId: string): Promise<ServiceResponse<Referral>> {
    return this.createReferral({
      referrerId: userId,
      refereeEmail: `pending-${Date.now()}@ka-ma-ro.local`,
    });
  },

  // Get referral leaderboard
  async getLeaderboard(limit: number = 10): Promise<
    ServiceResponse<
      Array<{
        userId: string;
        userName: string;
        totalReferrals: number;
        totalPoints: number;
      }>
    >
  > {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(
          `
          referrer_id,
          referrer_points_earned,
          user_profiles!referrals_referrer_id_fkey (
            id,
            full_name
          )
        `
        )
        .not('referrer_id', 'is', null);

      if (error) throw error;

      // Group by referrer and calculate totals
      const leaderboardMap = new Map<
        string,
        {
          userId: string;
          userName: string;
          totalReferrals: number;
          totalPoints: number;
        }
      >();

      data?.forEach((row: any) => {
        const userId = row.referrer_id;
        const existing = leaderboardMap.get(userId);

        if (existing) {
          existing.totalReferrals += 1;
          existing.totalPoints += row.referrer_points_earned || 0;
        } else {
          leaderboardMap.set(userId, {
            userId,
            userName: row.user_profiles?.full_name || 'Anonymous',
            totalReferrals: 1,
            totalPoints: row.referrer_points_earned || 0,
          });
        }
      });

      // Convert to array and sort
      const leaderboard = Array.from(leaderboardMap.values())
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, limit);

      return { data: leaderboard, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch leaderboard'),
      };
    }
  },
};
