import { createClient } from '@/lib/supabase/client';

interface RecommendationRequest {
  userId?: string;
  productId?: string;
  categoryPreference?: string;
  priceRange?: { min: number; max: number };
  limit?: number;
}

interface RecommendationResult {
  product_id: string;
  recommendation_type: string;
  reason: string;
  relevance_score: number;
}

interface BrowsingHistory {
  product_id: string;
  viewed_at: string;
  duration?: number;
}

interface UserPreferences {
  browsing_history: BrowsingHistory[];
  preferred_categories?: string[];
  price_sensitivity?: string;
}

interface ProductSummary {
  id: string;
  name: string;
  category?: string;
  price: number;
  description?: string;
  average_rating?: number;
  image_url?: string;
  image_alt?: string;
  review_count?: number;
  stock_status?: string;
}

class AIRecommendationService {
  private supabase = createClient();

  /**
   * Generate AI-powered product recommendations
   */
  async generateAIRecommendations(request: RecommendationRequest): Promise<RecommendationResult[]> {
    try {
      const { userId, productId, categoryPreference, priceRange, limit = 10 } = request;

      // Get user preferences and browsing history
      const userPreferences = userId ? await this.getUserPreferences(userId) : null;

      // Get product details if productId is provided
      const currentProduct = productId ? await this.getProductDetails(productId) : null;

      // Build context for AI recommendation
      const context = this.buildRecommendationContext({
        userPreferences,
        currentProduct,
        categoryPreference,
        priceRange,
      });

      // Call OpenAI API for intelligent recommendations
      const aiRecommendations = await this.callAIRecommendationAPI(context, limit);

      // Store recommendations in database
      if (userId && aiRecommendations.length > 0) {
        await this.storeRecommendations(userId, aiRecommendations);
      }

      return aiRecommendations;
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return [];
    }
  }

  /**
   * Get user preferences from customer_preferences table
   */
  private async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('customer_preferences')
        .select('browsing_history, preferred_language, engagement_score')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return (data ?? null) as UserPreferences | null;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  /**
   * Get product details
   */
  private async getProductDetails(productId: string) {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('id, name, category, price, description, average_rating')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return (data ?? null) as ProductSummary | null;
    } catch (error) {
      console.error('Error fetching product details:', error);
      return null;
    }
  }

  /**
   * Build context for AI recommendation
   */
  private buildRecommendationContext(params: any): string {
    const { userPreferences, currentProduct, categoryPreference, priceRange } = params;

    let context = 'Generate product recommendations based on:\n';

    if (currentProduct) {
      context += `Current Product: ${currentProduct.name} (${currentProduct.category})\n`;
      context += `Price: ${currentProduct.price}\n`;
    }

    if (userPreferences?.browsing_history) {
      context += `User has recently viewed ${userPreferences.browsing_history.length} products\n`;
    }

    if (categoryPreference) {
      context += `Preferred Category: ${categoryPreference}\n`;
    }

    if (priceRange) {
      context += `Price Range: ${priceRange.min} - ${priceRange.max}\n`;
    }

    return context;
  }

  /**
   * Call OpenAI API for recommendations (placeholder - actual implementation in API route)
   */
  private async callAIRecommendationAPI(
    context: string,
    limit: number
  ): Promise<RecommendationResult[]> {
    try {
      // This will be implemented via API route to keep API keys secure
      const response = await fetch('/api/openai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context,
          limit,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI recommendations');
      }

      const data = await response.json();
      return data.success ? data.data.recommendations : [];
    } catch (error) {
      console.error('Error calling AI recommendation API:', error);
      // Fallback to basic recommendations
      return this.getFallbackRecommendations(limit);
    }
  }

  /**
   * Fallback recommendations (when AI is unavailable)
   */
  private async getFallbackRecommendations(limit: number): Promise<RecommendationResult[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('id, name, category, price, average_rating')
        .eq('is_active', true)
        .order('average_rating', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return ((data || []) as ProductSummary[]).map((product) => ({
        product_id: product.id,
        recommendation_type: 'popular',
        reason: 'Top rated product',
        relevance_score: (product.average_rating ?? 0) / 5,
      }));
    } catch (error) {
      console.error('Error fetching fallback recommendations:', error);
      return [];
    }
  }

  /**
   * Store recommendations in database
   */
  private async storeRecommendations(
    userId: string,
    recommendations: RecommendationResult[]
  ): Promise<void> {
    try {
      const records = recommendations.map((rec) => ({
        user_id: userId,
        product_id: rec.product_id,
        recommendation_type: rec.recommendation_type,
        reason: rec.reason,
        relevance_score: rec.relevance_score,
      }));

      const { error } = await this.supabase.from('product_recommendations').insert(records as any);

      if (error) throw error;
    } catch (error) {
      console.error('Error storing recommendations:', error);
    }
  }

  /**
   * Get existing recommendations for user
   */
  async getUserRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('product_recommendations')
        .select(
          `
          *,
          products (
            id,
            name,
            price,
            image_url,
            image_alt,
            average_rating,
            review_count,
            category,
            stock_status
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as any[];
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
      return [];
    }
  }

  /**
   * Get similar products based on product ID
   */
  async getSimilarProducts(productId: string, limit: number = 6): Promise<any[]> {
    try {
      const product = await this.getProductDetails(productId);
      if (!product) return [];

      const { data, error } = await this.supabase
        .from('products')
        .select(
          'id, name, price, image_url, image_alt, average_rating, review_count, category, stock_status'
        )
        .eq('category', product.category)
        .neq('id', productId)
        .eq('is_active', true)
        .order('average_rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching similar products:', error);
      return [];
    }
  }

  /**
   * Update browsing history
   */
  async updateBrowsingHistory(userId: string, productId: string): Promise<void> {
    try {
      const { data: preferences } = await this.supabase
        .from('customer_preferences')
        .select('browsing_history')
        .eq('user_id', userId)
        .single();

      const typedPreferences = (preferences ?? null) as UserPreferences | null;
      const browsingHistory = typedPreferences?.browsing_history || [];
      const newEntry: BrowsingHistory = {
        product_id: productId,
        viewed_at: new Date().toISOString(),
      };

      // Keep only last 50 items
      const updatedHistory = [newEntry, ...browsingHistory].slice(0, 50);

      await this.supabase
        .from('customer_preferences')
        .update({ browsing_history: updatedHistory } as any)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating browsing history:', error);
    }
  }
}

export default new AIRecommendationService();
