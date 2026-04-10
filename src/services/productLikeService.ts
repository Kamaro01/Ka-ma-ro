import { supabase } from '@/lib/supabase/client';

export interface ProductLike {
  id: string;
  productId: string;
  userId: string;
  createdAt: string;
}

export interface ProductLikeInput {
  productId: string;
  userId: string;
}

class ProductLikeService {
  /**
   * Like a product
   */
  async likeProduct(productId: string, userId: string): Promise<ProductLike> {
    const { data, error } = await supabase
      .from('product_likes')
      .insert({
        product_id: productId,
        user_id: userId,
      })
      .select('id, product_id, user_id, created_at')
      .single();

    if (error) {
      console.error('Error liking product:', error);
      throw new Error(error.message || 'Failed to like product');
    }

    return this.convertToProductLike(data);
  }

  /**
   * Unlike a product
   */
  async unlikeProduct(productId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('product_likes')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error unliking product:', error);
      throw new Error(error.message || 'Failed to unlike product');
    }
  }

  /**
   * Check if user has liked a product
   */
  async hasUserLikedProduct(productId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('product_likes')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking product like:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Get product likes count
   */
  async getProductLikesCount(productId: string): Promise<number> {
    const { data, error } = await supabase
      .from('products')
      .select('likes_count')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error getting likes count:', error);
      return 0;
    }

    return data?.likes_count || 0;
  }

  /**
   * Get user's liked products
   */
  async getUserLikedProducts(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('product_likes')
      .select('product_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user liked products:', error);
      return [];
    }

    return (
      (data as Array<{ product_id: string }> | null)?.map(
        (like: { product_id: string }) => like.product_id
      ) || []
    );
  }

  /**
   * Toggle like status for a product
   */
  async toggleLike(productId: string, userId: string): Promise<boolean> {
    const isLiked = await this.hasUserLikedProduct(productId, userId);

    if (isLiked) {
      await this.unlikeProduct(productId, userId);
      return false;
    } else {
      await this.likeProduct(productId, userId);
      return true;
    }
  }

  /**
   * Convert snake_case to camelCase
   */
  private convertToProductLike(data: any): ProductLike {
    return {
      id: data.id,
      productId: data.product_id,
      userId: data.user_id,
      createdAt: data.created_at,
    };
  }
}

export const productLikeService = new ProductLikeService();
