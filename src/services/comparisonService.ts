import { createClient } from '@/lib/supabase/client';

interface ComparisonSession {
  id: string;
  user_id: string | null;
  session_name: string | null;
  product_ids: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  image_alt: string;
  category: string;
  average_rating: number;
  review_count: number;
  stock_status: string;
  current_stock: number;
  sku: string;
}

interface ComparisonData {
  session: ComparisonSession;
  products: Product[];
}

class ComparisonService {
  private supabase = createClient();

  /**
   * Create a new comparison session
   */
  async createComparisonSession(
    productIds: string[],
    sessionName?: string
  ): Promise<ComparisonSession | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      const { data, error } = await this.supabase
        .from('product_comparison_sessions')
        .insert({
          user_id: user?.id || null,
          product_ids: productIds,
          session_name: sessionName,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating comparison session:', error);
      return null;
    }
  }

  /**
   * Get comparison session by ID
   */
  async getComparisonSession(sessionId: string): Promise<ComparisonSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('product_comparison_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching comparison session:', error);
      return null;
    }
  }

  /**
   * Get products for comparison
   */
  async getComparisonProducts(productIds: string[]): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(
          'id, name, price, description, image_url, image_alt, category, average_rating, review_count, stock_status, current_stock, sku'
        )
        .in('id', productIds)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comparison products:', error);
      return [];
    }
  }

  /**
   * Get full comparison data (session + products)
   */
  async getFullComparisonData(sessionId: string): Promise<ComparisonData | null> {
    try {
      const session = await this.getComparisonSession(sessionId);
      if (!session) return null;

      const products = await this.getComparisonProducts(session.product_ids);

      return {
        session,
        products,
      };
    } catch (error) {
      console.error('Error fetching full comparison data:', error);
      return null;
    }
  }

  /**
   * Update comparison session (add/remove products)
   */
  async updateComparisonSession(sessionId: string, productIds: string[]): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('product_comparison_sessions')
        .update({ product_ids: productIds })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating comparison session:', error);
      return false;
    }
  }

  /**
   * Delete comparison session
   */
  async deleteComparisonSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('product_comparison_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting comparison session:', error);
      return false;
    }
  }

  /**
   * Get user's comparison sessions
   */
  async getUserComparisonSessions(): Promise<ComparisonSession[]> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await this.supabase
        .from('product_comparison_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user comparison sessions:', error);
      return [];
    }
  }

  /**
   * Archive comparison session
   */
  async archiveComparisonSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('product_comparison_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error archiving comparison session:', error);
      return false;
    }
  }
}

export default new ComparisonService();
