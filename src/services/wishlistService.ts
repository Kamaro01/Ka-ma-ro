import { supabase } from '@/lib/supabase/client';
import {
  WishlistItem,
  WishlistCategory,
  PriceAlert,
  WishlistItemWithProduct,
  WishlistStats,
} from '@/types/models';
import { Database } from '@/types/database.types';

type WishlistItemRow = Database['public']['Tables']['wishlist_items']['Row'];
type WishlistItemInsert = Database['public']['Tables']['wishlist_items']['Insert'];
type WishlistItemUpdate = Database['public']['Tables']['wishlist_items']['Update'];
type WishlistCategoryRow = Database['public']['Tables']['wishlist_categories']['Row'];
type WishlistCategoryInsert = Database['public']['Tables']['wishlist_categories']['Insert'];
type WishlistCategoryUpdate = Database['public']['Tables']['wishlist_categories']['Update'];
type PriceAlertRow = Database['public']['Tables']['price_alerts']['Row'];
type PriceAlertInsert = Database['public']['Tables']['price_alerts']['Insert'];
type PriceAlertUpdate = Database['public']['Tables']['price_alerts']['Update'];

// Convert snake_case to camelCase
const convertWishlistItemToCamelCase = (row: WishlistItemRow): WishlistItem => ({
  id: row.id,
  userId: row.user_id,
  productId: row.product_id,
  addedAt: row.added_at,
  notes: row.notes ?? undefined,
  priority: row.priority,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const convertWishlistCategoryToCamelCase = (row: WishlistCategoryRow): WishlistCategory => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  description: row.description ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const convertPriceAlertToCamelCase = (row: PriceAlertRow): PriceAlert => ({
  id: row.id,
  wishlistItemId: row.wishlist_item_id,
  targetPrice: Number(row.target_price),
  isActive: row.is_active,
  notifiedAt: row.notified_at ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const wishlistService = {
  // Get all wishlist items for a user with product details
  async getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]> {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(
        `
        *,
        product:products(
          id, name, price, image_url, image_alt, current_stock, stock_status, 
          average_rating, review_count, is_active
        ),
        price_alert:price_alerts(*)
      `
      )
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      ...convertWishlistItemToCamelCase(row),
      product: row.product
        ? {
            id: row.product.id,
            name: row.product.name,
            price: Number(row.product.price),
            imageUrl: row.product.image_url,
            imageAlt: row.product.image_alt,
            currentStock: row.product.current_stock,
            stockStatus: row.product.stock_status,
            averageRating: Number(row.product.average_rating ?? 0),
            reviewCount: row.product.review_count ?? 0,
            isActive: row.product.is_active,
          }
        : undefined,
      priceAlert: row.price_alert ? convertPriceAlertToCamelCase(row.price_alert) : undefined,
    })) as WishlistItemWithProduct[];
  },

  // Add item to wishlist
  async addToWishlist(
    userId: string,
    productId: string,
    notes?: string,
    priority: number = 0
  ): Promise<WishlistItem> {
    const insertData: WishlistItemInsert = {
      user_id: userId,
      product_id: productId,
      notes: notes ?? null,
      priority: priority,
    };

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return convertWishlistItemToCamelCase(data);
  },

  // Remove item from wishlist
  async removeFromWishlist(wishlistItemId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', wishlistItemId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Update wishlist item
  async updateWishlistItem(
    wishlistItemId: string,
    userId: string,
    updates: { notes?: string; priority?: number }
  ): Promise<WishlistItem> {
    const updateData: WishlistItemUpdate = {
      notes: updates.notes,
      priority: updates.priority,
    };

    const { data, error } = await supabase
      .from('wishlist_items')
      .update(updateData)
      .eq('id', wishlistItemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return convertWishlistItemToCamelCase(data);
  },

  // Check if product is in wishlist
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return !!data;
  },

  // Get wishlist categories
  async getCategories(userId: string): Promise<WishlistCategory[]> {
    const { data, error } = await supabase
      .from('wishlist_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map(convertWishlistCategoryToCamelCase);
  },

  // Create wishlist category
  async createCategory(
    userId: string,
    name: string,
    description?: string
  ): Promise<WishlistCategory> {
    const insertData: WishlistCategoryInsert = {
      user_id: userId,
      name: name,
      description: description ?? null,
    };

    const { data, error } = await supabase
      .from('wishlist_categories')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return convertWishlistCategoryToCamelCase(data);
  },

  // Delete wishlist category
  async deleteCategory(categoryId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('wishlist_categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Assign category to wishlist item
  async assignCategory(wishlistItemId: string, categoryId: string): Promise<void> {
    const { error } = await supabase.from('wishlist_item_categories').insert({
      wishlist_item_id: wishlistItemId,
      category_id: categoryId,
    });

    if (error) throw error;
  },

  // Remove category from wishlist item
  async removeCategory(wishlistItemId: string, categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('wishlist_item_categories')
      .delete()
      .eq('wishlist_item_id', wishlistItemId)
      .eq('category_id', categoryId);

    if (error) throw error;
  },

  // Create price alert
  async createPriceAlert(wishlistItemId: string, targetPrice: number): Promise<PriceAlert> {
    const insertData: PriceAlertInsert = {
      wishlist_item_id: wishlistItemId,
      target_price: targetPrice,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('price_alerts')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return convertPriceAlertToCamelCase(data);
  },

  // Update price alert
  async updatePriceAlert(
    alertId: string,
    updates: { targetPrice?: number; isActive?: boolean }
  ): Promise<PriceAlert> {
    const updateData: PriceAlertUpdate = {
      target_price: updates.targetPrice,
      is_active: updates.isActive,
    };

    const { data, error } = await supabase
      .from('price_alerts')
      .update(updateData)
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;

    return convertPriceAlertToCamelCase(data);
  },

  // Delete price alert
  async deletePriceAlert(alertId: string): Promise<void> {
    const { error } = await supabase.from('price_alerts').delete().eq('id', alertId);

    if (error) throw error;
  },

  // Get wishlist statistics
  async getWishlistStats(userId: string): Promise<WishlistStats> {
    const { data: items, error } = await supabase
      .from('wishlist_items')
      .select(
        `
        id,
        product:products(price)
      `
      )
      .eq('user_id', userId);

    if (error) throw error;

    const { data: categorizedCount } = await supabase
      .from('wishlist_item_categories')
      .select('wishlist_item_id', { count: 'exact' })
      .in(
        'wishlist_item_id',
        (items as Array<{ id: string }> | null)?.map((i: { id: string }) => i.id) || []
      );

    const { data: alertsCount } = await supabase
      .from('price_alerts')
      .select('id', { count: 'exact' })
      .in(
        'wishlist_item_id',
        (items as Array<{ id: string }> | null)?.map((i: { id: string }) => i.id) || []
      )
      .eq('is_active', true);

    const prices = (items || [])
      .map((i: any) => Number(i.product?.price ?? 0))
      .filter((p: number) => p > 0);

    const averagePrice =
      prices.length > 0 ? prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length : 0;

    return {
      totalItems: items?.length || 0,
      categorizedItems: categorizedCount?.length || 0,
      priceAlerts: alertsCount?.length || 0,
      averagePrice: averagePrice,
    };
  },

  // Move item to cart
  async moveToCart(wishlistItemId: string, userId: string): Promise<void> {
    // Get wishlist item details
    const { data: wishlistItem, error: fetchError } = await supabase
      .from('wishlist_items')
      .select('product_id')
      .eq('id', wishlistItemId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    // This would integrate with your cart service
    // For now, we just remove from wishlist
    await this.removeFromWishlist(wishlistItemId, userId);
  },
};
