// Product management types
export interface ProductLike {
  id: string;
  productId: string;
  userId: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  alt?: string;
  sku: string;
  price: number;
  costPrice?: number;
  category?: string;
  imageUrl?: string;
  imageAlt?: string;
  averageRating?: number;
  reviewCount?: number;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  reorderPoint: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  isActive: boolean;
  inStock?: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  comingSoon?: boolean;
  launchDate?: string;
  specifications?: Record<string, string | number | boolean | null>;
}

export interface ProductFilters {
  category?: string;
  stockStatus?: string;
  isActive?: boolean;
  search?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface BulkPriceUpdate {
  productIds: string[];
  priceAdjustment:
    | number
    | {
        type: 'percentage' | 'fixed';
        value: number;
        applyTo: 'price' | 'cost_price';
      };
  adjustmentType: 'percentage' | 'fixed';
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  orderId: string | null;
  rating: number;
  title: string;
  reviewText: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface ReviewHelpfulVote {
  id: string;
  reviewId: string;
  userId: string;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  title: string;
  reviewText: string;
  orderId?: string | null;
  images?: string[];
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
  notes?: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  categories?: WishlistCategory[];
  priceAlert?: PriceAlert;
}

export interface WishlistCategory {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
}

export interface WishlistItemCategory {
  id: string;
  wishlistItemId: string;
  categoryId: string;
  createdAt: string;
}

export interface PriceAlert {
  id: string;
  wishlistItemId: string;
  targetPrice: number;
  isActive: boolean;
  notifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItemWithProduct extends WishlistItem {
  product: Product;
}

export interface WishlistStats {
  totalItems: number;
  categorizedItems: number;
  priceAlerts: number;
  averagePrice: number;
}

export interface RewardPoints {
  id: string;
  userId: string;
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tierProgress: number;
  nextTierPoints: number;
  createdAt: string;
  updatedAt: string;
}

// Rewards System Types
export interface UserReward {
  id: string;
  userId: string;
  totalPoints: number;
  lifetimePoints: number;
  pointsRedeemed: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | 'earned_purchase'
  | 'earned_review'
  | 'earned_referral_signup'
  | 'earned_referral_purchase'
  | 'redeemed_discount'
  | 'expired'
  | 'admin_adjustment';

export interface RewardTransaction {
  id: string;
  userId: string;
  transactionType: TransactionType;
  points: number;
  pointsAmount?: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  expiresAt?: string;
  createdAt: string;
}

export type ReferralStatus = 'pending' | 'signed_up' | 'first_purchase_complete' | 'active';

export interface Referral {
  id: string;
  referrerId: string;
  refereeId?: string;
  refereeEmail: string;
  referralCode: string;
  referralStatus: ReferralStatus;
  status?: ReferralStatus;
  signupDate?: string;
  firstPurchaseDate?: string;
  referrerPointsEarned: number;
  refereePointsEarned: number;
  pointsAwarded?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountRedemption {
  id: string;
  userId: string;
  orderId?: string;
  pointsUsed: number;
  discountAmount: number;
  discountCode: string;
  appliedAt: string;
  redemptionType: 'discount' | 'free_shipping' | 'gift_card' | 'exclusive_product';
  status: 'pending' | 'applied' | 'expired' | 'cancelled';
  createdAt: string;
}

export interface RewardConfig {
  id: string;
  configKey: string;
  configValue: {
    points_per_dollar?: number;
    min_order_amount?: number;
    points_per_review?: number;
    max_per_product?: number;
    referrer_signup_points?: number;
    referrer_purchase_points?: number;
    referee_signup_points?: number;
    points_per_dollar_discount?: number;
    min_points_for_redemption?: number;
    max_discount_percentage?: number;
  };
  description?: string;
  updatedAt: string;
}

export interface RewardTier {
  id: string;
  tierLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsRequired: number;
  discountPercentage: number;
  freeShipping: boolean;
  exclusiveAccess: boolean;
  tierName: string;
  tierDescription?: string;
  benefits: string[];
  createdAt: string;
}

export interface Redemption {
  id: string;
  userId: string;
  redemptionType: 'discount' | 'free_shipping' | 'gift_card' | 'exclusive_product';
  pointsUsed: number;
  discountAmount?: number;
  discountCode?: string;
  status: 'pending' | 'applied' | 'expired' | 'cancelled';
  orderId?: string;
  expiresAt?: string;
  createdAt: string;
  redeemedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: 'customer' | 'admin' | 'super_admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: UserProfile;
}
