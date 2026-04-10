import { supabase } from '@/lib/supabase/client';
import { ProductReview, ReviewStats, CreateReviewInput } from '@/types/models';
import { Database } from '@/types/database.types';

type ReviewRow = Database['public']['Tables']['product_reviews']['Row'];
type ReviewInsert = Database['public']['Tables']['product_reviews']['Insert'];
type VoteRow = Database['public']['Tables']['review_helpful_votes']['Row'];

// Convert snake_case DB row to camelCase model
function convertReviewToModel(row: ReviewRow & { user_profiles?: any }): ProductReview {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    orderId: row.order_id,
    rating: row.rating,
    title: row.title,
    reviewText: row.review_text,
    reviewStatus: row.review_status,
    isVerifiedPurchase: row.is_verified_purchase,
    helpfulCount: row.helpful_count,
    images: Array.isArray(row.images) ? row.images : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    user: row.user_profiles
      ? {
          id: row.user_profiles.id,
          fullName: row.user_profiles.full_name || '',
          email: row.user_profiles.email,
        }
      : undefined,
  };
}

export const reviewService = {
  // Get all approved reviews for a product
  async getByProductId(productId: string): Promise<ProductReview[]> {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(
        `
        *,
        user_profiles:user_profiles(id, full_name, email)
      `
      )
      .eq('product_id', productId)
      .eq('review_status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(convertReviewToModel);
  },

  // Get review statistics for a product
  async getReviewStats(productId: string): Promise<ReviewStats> {
    const { data, error } = await supabase
      .from('products')
      .select('average_rating, review_count, rating_distribution')
      .eq('id', productId)
      .single();

    if (error) throw error;

    return {
      averageRating: data?.average_rating || 0,
      totalReviews: data?.review_count || 0,
      ratingDistribution: data?.rating_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  },

  // Create a new review
  async createReview(review: CreateReviewInput): Promise<ProductReview> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const insertData: ReviewInsert = {
      product_id: review.productId,
      user_id: user.id,
      order_id: review.orderId,
      rating: review.rating,
      title: review.title,
      review_text: review.reviewText,
      images: review.images || [],
    };

    const { data, error } = await supabase
      .from('product_reviews')
      .insert(insertData)
      .select(
        `
        *,
        user_profiles:user_profiles(id, full_name, email)
      `
      )
      .single();

    if (error) throw error;
    return convertReviewToModel(data);
  },

  // Update a review
  async updateReview(
    reviewId: string,
    updates: Partial<CreateReviewInput>
  ): Promise<ProductReview> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updateData: any = {};
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.reviewText !== undefined) updateData.review_text = updates.reviewText;
    if (updates.images !== undefined) updateData.images = updates.images;

    const { data, error } = await supabase
      .from('product_reviews')
      .update(updateData)
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .select(
        `
        *,
        user_profiles:user_profiles(id, full_name, email)
      `
      )
      .single();

    if (error) throw error;
    return convertReviewToModel(data);
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Mark review as helpful
  async markHelpful(reviewId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('review_helpful_votes').insert({
      review_id: reviewId,
      user_id: user.id,
    });

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error('You have already marked this review as helpful');
      }
      throw error;
    }
  },

  // Unmark review as helpful
  async unmarkHelpful(reviewId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('review_helpful_votes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Check if user has marked review as helpful
  async hasMarkedHelpful(reviewId: string): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('review_helpful_votes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data !== null;
  },

  // Get user's own reviews for a product (to check if they already reviewed)
  async getUserReviewForProduct(productId: string): Promise<ProductReview | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('product_reviews')
      .select(
        `
        *,
        user_profiles:user_profiles(id, full_name, email)
      `
      )
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data ? convertReviewToModel(data) : null;
  },

  // Check if user has purchased and can review
  async canUserReview(productId: string): Promise<{ canReview: boolean; orderId?: string }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { canReview: false };

    // Check if user has delivered order with this product
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_items!inner(product_id)
      `
      )
      .eq('user_id', user.id)
      .eq('order_status', 'delivered')
      .eq('order_items.product_id', productId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return {
      canReview: data !== null,
      orderId: data?.id,
    };
  },
};
