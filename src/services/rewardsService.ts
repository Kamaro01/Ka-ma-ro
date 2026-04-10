import { supabase } from '@/lib/supabase/client';
import { referralService } from '@/services/referralService';
import {
  UserReward,
  RewardTransaction,
  DiscountRedemption,
  RewardConfig,
  TransactionType,
} from '@/types/models';

interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

interface RewardsStats {
  totalPoints: number;
  lifetimePoints: number;
  pointsRedeemed: number;
  recentTransactions: RewardTransaction[];
  upcomingExpiry?: {
    points: number;
    expiryDate: string;
  };
}

export const rewardsService = {
  // Get user's reward account
  async getUserRewards(userId: string): Promise<ServiceResponse<UserReward>> {
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (!data) {
        return { data: null, error: null };
      }

      return {
        data: {
          id: data.id,
          userId: data.user_id,
          totalPoints: data.total_points,
          lifetimePoints: data.lifetime_points,
          pointsRedeemed: data.points_redeemed,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch rewards'),
      };
    }
  },

  async getUserRewardPoints(userId: string): Promise<ServiceResponse<any>> {
    const result = await this.getUserRewards(userId);

    return {
      data: result.data
        ? {
            id: result.data.id,
            userId: result.data.userId,
            totalPoints: result.data.totalPoints,
            availablePoints: result.data.totalPoints,
            lifetimePoints: result.data.lifetimePoints,
            pointsRedeemed: result.data.pointsRedeemed,
            currentTier: 'bronze',
            tierProgress: result.data.totalPoints,
            nextTierPoints: 500,
            createdAt: result.data.createdAt,
            updatedAt: result.data.updatedAt,
          }
        : null,
      error: result.error,
    };
  },

  // Get reward transactions history
  async getTransactionHistory(
    userId: string,
    limit: number = 50
  ): Promise<ServiceResponse<RewardTransaction[]>> {
    try {
      const { data, error } = await supabase
        .from('reward_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        data: (data || []).map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          transactionType: row.transaction_type as TransactionType,
          points: row.points,
          description: row.description,
          referenceId: row.reference_id,
          referenceType: row.reference_type,
          expiresAt: row.expires_at,
          createdAt: row.created_at,
        })),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch transactions'),
      };
    }
  },

  async getUserTransactions(userId: string, limit: number = 50) {
    const result = await this.getTransactionHistory(userId, limit);
    return {
      data:
        result.data?.map((transaction) => ({
          ...transaction,
          pointsAmount: transaction.points,
        })) || [],
      error: result.error,
    };
  },

  // Get rewards statistics
  async getRewardsStats(userId: string): Promise<ServiceResponse<RewardsStats>> {
    try {
      const [rewardsResult, transactionsResult] = await Promise.all([
        this.getUserRewards(userId),
        this.getTransactionHistory(userId, 10),
      ]);

      if (rewardsResult.error) throw rewardsResult.error;
      if (transactionsResult.error) throw transactionsResult.error;

      // Get points expiring soon
      const { data: expiringPoints } = await supabase
        .from('reward_transactions')
        .select('points, expires_at')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true })
        .limit(1)
        .single();

      const stats: RewardsStats = {
        totalPoints: rewardsResult.data?.totalPoints || 0,
        lifetimePoints: rewardsResult.data?.lifetimePoints || 0,
        pointsRedeemed: rewardsResult.data?.pointsRedeemed || 0,
        recentTransactions: transactionsResult.data || [],
        upcomingExpiry: expiringPoints
          ? {
              points: expiringPoints.points,
              expiryDate: expiringPoints.expires_at,
            }
          : undefined,
      };

      return { data: stats, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch rewards stats'),
      };
    }
  },

  // Calculate discount from points
  async calculateDiscount(points: number): Promise<ServiceResponse<number>> {
    try {
      const { data, error } = await supabase
        .from('reward_config')
        .select('config_value')
        .eq('config_key', 'redemption_rules')
        .single();

      if (error) throw error;

      const pointsPerDollar = data?.config_value?.points_per_dollar_discount || 100;
      const discountAmount = points / pointsPerDollar;

      return { data: discountAmount, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to calculate discount'),
      };
    }
  },

  // Redeem points for discount
  async redeemPoints(
    userId: string,
    points: number,
    orderId?: string
  ): Promise<ServiceResponse<DiscountRedemption>> {
    try {
      // Get discount amount
      const discountResult = await this.calculateDiscount(points);
      if (discountResult.error || !discountResult.data) {
        throw new Error('Failed to calculate discount');
      }

      // Generate discount code
      const discountCode = `REWARD${Date.now().toString(36).toUpperCase()}`;

      // Create redemption record
      const { data, error } = await supabase
        .from('discount_redemptions')
        .insert({
          user_id: userId,
          order_id: orderId,
          points_used: points,
          discount_amount: discountResult.data,
          discount_code: discountCode,
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct points from user account
      await supabase.rpc('award_points', {
        p_user_id: userId,
        p_points: -points,
        p_transaction_type: 'redeemed_discount',
        p_description: `Redeemed ${points} points for $${discountResult.data.toFixed(2)} discount`,
        p_reference_id: data?.id,
        p_reference_type: 'redemption',
      });

      return {
        data: {
          id: data.id,
          userId: data.user_id,
          orderId: data.order_id,
          pointsUsed: data.points_used,
          discountAmount: data.discount_amount,
          discountCode: data.discount_code,
          appliedAt: data.applied_at,
          redemptionType: 'discount',
          status: 'applied',
          createdAt: data.created_at || data.applied_at,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to redeem points'),
      };
    }
  },

  async createRedemption(
    userId: string,
    redemptionType: string,
    points: number,
    discountAmount?: number
  ): Promise<ServiceResponse<any>> {
    if (redemptionType === 'discount' || redemptionType === 'gift_card') {
      return this.redeemPoints(userId, points);
    }

    const code = `${redemptionType.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    return {
      data: {
        id: code,
        userId,
        redemptionType: redemptionType as DiscountRedemption['redemptionType'],
        pointsUsed: points,
        discountAmount,
        discountCode: code,
        appliedAt: new Date().toISOString(),
        status: 'applied',
        createdAt: new Date().toISOString(),
      },
      error: null,
    };
  },

  // Get all reward configurations
  async getRewardConfigs(): Promise<ServiceResponse<RewardConfig[]>> {
    try {
      const { data, error } = await supabase.from('reward_config').select('*');

      if (error) throw error;

      return {
        data: (data || []).map((row: any) => ({
          id: row.id,
          configKey: row.config_key,
          configValue: row.config_value,
          description: row.description,
          updatedAt: row.updated_at,
        })),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch reward configs'),
      };
    }
  },

  // Get user's discount redemptions
  async getUserRedemptions(userId: string): Promise<ServiceResponse<DiscountRedemption[]>> {
    try {
      const { data, error } = await supabase
        .from('discount_redemptions')
        .select('*')
        .eq('user_id', userId)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      return {
        data: (data || []).map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          orderId: row.order_id,
          pointsUsed: row.points_used,
          discountAmount: row.discount_amount,
          discountCode: row.discount_code,
          appliedAt: row.applied_at,
          redemptionType: 'discount',
          status: row.status || 'applied',
          createdAt: row.created_at || row.applied_at,
        })),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch redemptions'),
      };
    }
  },

  async getAllTiers(): Promise<ServiceResponse<any[]>> {
    return {
      data: [
        {
          id: 'bronze',
          tierLevel: 'bronze',
          pointsRequired: 0,
          tierName: 'Bronze',
          benefits: ['Basic rewards access'],
        },
        {
          id: 'silver',
          tierLevel: 'silver',
          pointsRequired: 500,
          tierName: 'Silver',
          benefits: ['Priority offers'],
        },
        {
          id: 'gold',
          tierLevel: 'gold',
          pointsRequired: 1000,
          tierName: 'Gold',
          benefits: ['Higher reward rates'],
        },
        {
          id: 'platinum',
          tierLevel: 'platinum',
          pointsRequired: 2500,
          tierName: 'Platinum',
          benefits: ['Exclusive access'],
        },
      ],
      error: null,
    };
  },

  async getUserReferrals(userId: string): Promise<ServiceResponse<any[]>> {
    const result = await referralService.getUserReferrals(userId);
    return {
      data:
        result.data?.map((referral: any) => ({
          ...referral,
          status: referral.referralStatus,
          pointsAwarded: referral.referrerPointsEarned,
        })) || [],
      error: result.error,
    };
  },

  async createReferral(userId: string): Promise<ServiceResponse<any>> {
    const result = await referralService.generateReferralCode(userId);
    return {
      data: result.data
        ? {
            ...result.data,
            status: result.data.referralStatus,
            pointsAwarded: result.data.referrerPointsEarned,
          }
        : null,
      error: result.error,
    };
  },
};
