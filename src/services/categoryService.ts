import { createClient } from '@/lib/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  featured_image?: string;
  featured_image_alt?: string;
  seo_title?: string;
  seo_description?: string;
  product_count: number;
  display_order: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parent_id?: string;
  featured_image?: string;
  featured_image_alt?: string;
  seo_title?: string;
  seo_description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

const supabase = createClient();
const asCategoryArray = (data: unknown): Category[] => (data ?? []) as Category[];
const asCategory = (data: unknown): Category | null => (data ?? null) as Category | null;

export const categoryService = {
  // Get all categories with optional filters
  async getAllCategories(filters?: {
    isActive?: boolean;
    parentId?: string | null;
    searchTerm?: string;
  }): Promise<{ data: Category[]; error: any }> {
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.parentId !== undefined) {
        if (filters.parentId === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', filters.parentId);
        }
      }

      if (filters?.searchTerm) {
        query = query.or(
          `name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: asCategoryArray(data), error: null };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: [], error };
    }
  },

  // Get category by ID
  async getCategoryById(id: string): Promise<{ data: Category | null; error: any }> {
    try {
      const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();

      if (error) throw error;
      return { data: asCategory(data), error: null };
    } catch (error) {
      console.error('Error fetching category:', error);
      return { data: null, error };
    }
  },

  // Get category hierarchy (with children)
  async getCategoryHierarchy(): Promise<{ data: any[]; error: any }> {
    try {
      // Get all categories
      const { data: allCategories, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Build hierarchy
      const categoryMap = new Map<
        string,
        Category & { children: Array<Category & { children: any[] }> }
      >();
      const rootCategories: any[] = [];

      asCategoryArray(allCategories).forEach((cat) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      categoryMap.forEach((cat: any) => {
        if (cat.parent_id) {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            parent.children.push(cat);
          }
        } else {
          rootCategories.push(cat);
        }
      });

      return { data: rootCategories, error: null };
    } catch (error) {
      console.error('Error fetching category hierarchy:', error);
      return { data: [], error };
    }
  },

  // Create new category
  async createCategory(input: CreateCategoryInput): Promise<{ data: Category | null; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            ...input,
            created_by: user?.id,
          },
        ] as any)
        .select()
        .single();

      if (error) throw error;
      return { data: asCategory(data), error: null };
    } catch (error) {
      console.error('Error creating category:', error);
      return { data: null, error };
    }
  },

  // Update category
  async updateCategory(input: UpdateCategoryInput): Promise<{ data: Category | null; error: any }> {
    try {
      const { id, ...updateData } = input;

      const { data, error } = await supabase
        .from('categories')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: asCategory(data), error: null };
    } catch (error) {
      console.error('Error updating category:', error);
      return { data: null, error };
    }
  },

  // Delete category
  async deleteCategory(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { error };
    }
  },

  // Bulk update category display order
  async updateCategoryOrder(
    updates: { id: string; display_order: number }[]
  ): Promise<{ error: any }> {
    try {
      const promises = updates.map((update) =>
        supabase
          .from('categories')
          .update({ display_order: update.display_order } as any)
          .eq('id', update.id)
      );

      await Promise.all(promises);
      return { error: null };
    } catch (error) {
      console.error('Error updating category order:', error);
      return { error };
    }
  },

  // Assign product to category
  async assignProductToCategory(
    productId: string,
    categoryId: string,
    isPrimary: boolean = false
  ): Promise<{ error: any }> {
    try {
      const { error } = await supabase.from('product_categories').insert([
        {
          product_id: productId,
          category_id: categoryId,
          is_primary: isPrimary,
        },
      ] as any);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error assigning product to category:', error);
      return { error };
    }
  },

  // Remove product from category
  async removeProductFromCategory(productId: string, categoryId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('product_id', productId)
        .eq('category_id', categoryId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error removing product from category:', error);
      return { error };
    }
  },

  // Get products by category
  async getProductsByCategory(categoryId: string): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select(
          `
          product_id,
          is_primary,
          products (*)
        `
        )
        .eq('category_id', categoryId);

      if (error) throw error;
      return { data: (data || []) as any[], error: null };
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return { data: [], error };
    }
  },
};
