import { createClient } from '@/lib/supabase/client';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost_price?: number;
  category?: string;
  image_url?: string;
  image_alt?: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_point: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

const toModelProduct = (product: Product) => ({
  id: product.id,
  name: product.name,
  sku: product.sku,
  description: product.description,
  price: product.price,
  costPrice: product.cost_price,
  category: product.category,
  imageUrl: product.image_url,
  imageAlt: product.image_alt,
  currentStock: product.current_stock,
  minimumStock: product.minimum_stock,
  maximumStock: product.maximum_stock,
  reorderPoint: product.reorder_point,
  stockStatus: product.stock_status,
  isActive: product.is_active,
  createdBy: product.created_by,
  createdAt: product.created_at,
  updatedAt: product.updated_at,
});

export interface CreateProductInput {
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost_price?: number;
  category?: string;
  image_url?: string;
  image_alt?: string;
  current_stock?: number;
  minimum_stock?: number;
  maximum_stock?: number;
  reorder_point?: number;
  is_active?: boolean;
  categoryIds?: string[]; // For assigning to multiple categories
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface BulkPriceUpdate {
  productIds: string[];
  priceAdjustment: {
    type: 'percentage' | 'fixed';
    value: number;
    applyTo: 'price' | 'cost_price';
  };
}

const supabase = createClient();

export const productService = {
  // Get all products with optional filters
  async getAllProducts(filters?: {
    isActive?: boolean;
    category?: string;
    stockStatus?: string;
    searchTerm?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ data: Product[]; error: any }> {
    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.stockStatus) {
        query = query.eq('stock_status', filters.stockStatus);
      }

      if (filters?.searchTerm) {
        query = query.or(
          `name.ilike.%${filters.searchTerm}%,sku.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`
        );
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: [], error };
    }
  },

  async getAll(filters?: {
    isActive?: boolean;
    category?: string;
    stockStatus?: string;
    search?: string;
    priceMin?: number;
    priceMax?: number;
  }) {
    const result = await this.getAllProducts({
      isActive: filters?.isActive,
      category: filters?.category,
      stockStatus: filters?.stockStatus,
      searchTerm: filters?.search,
      minPrice: filters?.priceMin,
      maxPrice: filters?.priceMax,
    });

    return {
      data: result.data.map(toModelProduct),
      error: result.error,
    };
  },

  // Get product by ID
  async getProductById(id: string): Promise<{ data: Product | null; error: any }> {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { data: null, error };
    }
  },

  async getById(id: string) {
    const result = await this.getProductById(id);
    return {
      data: result.data ? toModelProduct(result.data) : null,
      error: result.error,
    };
  },

  // Create new product
  async createProduct(input: CreateProductInput): Promise<{ data: Product | null; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { categoryIds, ...productData } = input;

      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            ...productData,
            created_by: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Assign to categories if provided
      if (data && categoryIds && categoryIds.length > 0) {
        const categoryAssignments = categoryIds.map((catId, index) => ({
          product_id: data.id,
          category_id: catId,
          is_primary: index === 0, // First category is primary
        }));

        await supabase.from('product_categories').insert(categoryAssignments);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error creating product:', error);
      return { data: null, error };
    }
  },

  async create(input: Record<string, any>) {
    const result = await this.createProduct({
      name: input.name,
      sku: input.sku,
      description: input.description,
      price: input.price,
      cost_price: input.costPrice,
      category: input.category,
      image_url: input.imageUrl,
      image_alt: input.imageAlt,
      current_stock: input.currentStock,
      minimum_stock: input.minimumStock,
      maximum_stock: input.maximumStock,
      reorder_point: input.reorderPoint,
      is_active: input.isActive,
    } as CreateProductInput);

    return {
      data: result.data ? toModelProduct(result.data) : null,
      error: result.error,
    };
  },

  // Update product
  async updateProduct(input: UpdateProductInput): Promise<{ data: Product | null; error: any }> {
    try {
      const { id, categoryIds, ...updateData } = input;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update category assignments if provided
      if (categoryIds) {
        // Remove existing assignments
        await supabase.from('product_categories').delete().eq('product_id', id);

        // Add new assignments
        if (categoryIds.length > 0) {
          const categoryAssignments = categoryIds.map((catId, index) => ({
            product_id: id,
            category_id: catId,
            is_primary: index === 0,
          }));

          await supabase.from('product_categories').insert(categoryAssignments);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error updating product:', error);
      return { data: null, error };
    }
  },

  async update(id: string, updates: Record<string, any>) {
    const result = await this.updateProduct({
      id,
      name: updates.name,
      sku: updates.sku,
      description: updates.description,
      price: updates.price,
      cost_price: updates.costPrice,
      category: updates.category,
      image_url: updates.imageUrl,
      image_alt: updates.imageAlt,
      current_stock: updates.currentStock,
      minimum_stock: updates.minimumStock,
      maximum_stock: updates.maximumStock,
      reorder_point: updates.reorderPoint,
      is_active: updates.isActive,
    } as UpdateProductInput);

    return {
      data: result.data ? toModelProduct(result.data) : null,
      error: result.error,
    };
  },

  // Delete product
  async deleteProduct(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { error };
    }
  },

  async delete(id: string) {
    return this.deleteProduct(id);
  },

  // Bulk price update
  async bulkUpdatePrices(update: BulkPriceUpdate): Promise<{ error: any }> {
    try {
      const { productIds, priceAdjustment } = update;
      const { type, value, applyTo } = priceAdjustment;

      // Get current products
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, price, cost_price')
        .in('id', productIds);

      if (fetchError) throw fetchError;

      // Calculate new prices
      const updates = products?.map((product: any) => {
        const currentPrice = applyTo === 'price' ? product.price : product.cost_price;
        let newPrice = currentPrice;

        if (type === 'percentage') {
          newPrice = currentPrice * (1 + value / 100);
        } else {
          newPrice = currentPrice + value;
        }

        return {
          id: product.id,
          [applyTo]: Math.max(0, newPrice), // Ensure non-negative prices
        };
      });

      // Update all products
      if (updates && updates.length > 0) {
        const promises = updates.map((u: any) =>
          supabase
            .from('products')
            .update({ [applyTo]: u[applyTo] })
            .eq('id', u.id)
        );

        await Promise.all(promises);
      }

      return { error: null };
    } catch (error) {
      console.error('Error bulk updating prices:', error);
      return { error };
    }
  },

  async duplicate(id: string): Promise<{ data: Product | null; error: any }> {
    const existing = await this.getProductById(id);
    if (existing.error || !existing.data) {
      return { data: null, error: existing.error || new Error('Product not found') };
    }

    const clone = await this.createProduct({
      name: `${existing.data.name} Copy`,
      sku: `${existing.data.sku}-COPY-${Date.now()}`,
      description: existing.data.description,
      price: existing.data.price,
      cost_price: existing.data.cost_price,
      category: existing.data.category,
      image_url: existing.data.image_url,
      image_alt: existing.data.image_alt,
      current_stock: existing.data.current_stock,
      minimum_stock: existing.data.minimum_stock,
      maximum_stock: existing.data.maximum_stock,
      reorder_point: existing.data.reorder_point,
      is_active: existing.data.is_active,
    });

    return {
      data: clone.data,
      error: clone.error,
    };
  },

  async getCategories(): Promise<{ data: string[]; error: any }> {
    const result = await this.getAllProducts();
    const categories = Array.from(
      new Set(result.data.map((product) => product.category).filter(Boolean))
    ) as string[];

    return {
      data: categories,
      error: result.error,
    };
  },

  // Get product categories
  async getProductCategories(productId: string): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select(
          `
          category_id,
          is_primary,
          categories (*)
        `
        )
        .eq('product_id', productId);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching product categories:', error);
      return { data: [], error };
    }
  },

  // Upload product image
  async uploadProductImage(
    file: File,
    productId: string
  ): Promise<{ data: string | null; error: any }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('product-images').getPublicUrl(filePath);

      return { data: publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { data: null, error };
    }
  },

  // Delete product image
  async deleteProductImage(imageUrl: string): Promise<{ error: any }> {
    try {
      const filePath = imageUrl.split('/product-images/')[1];
      if (!filePath) return { error: null };

      const { error } = await supabase.storage
        .from('product-images')
        .remove([`product-images/${filePath}`]);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { error };
    }
  },
};
