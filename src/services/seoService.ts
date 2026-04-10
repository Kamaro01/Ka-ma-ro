import { supabase } from '@/lib/supabase/client';

export interface SeoPage {
  id: string;
  page_type: 'home' | 'product' | 'category' | 'custom' | 'blog' | 'landing';
  page_path: string;
  title: string;
  description: string;
  keywords?: string[];
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  schema_markup?: any;
  robots_directives?: string[];
  priority?: number;
  is_active?: boolean;
}

export interface TrustBadge {
  id: string;
  name: string;
  badge_type: 'security' | 'payment' | 'certification' | 'award' | 'guarantee' | 'shipping';
  image_url: string;
  image_alt: string;
  title: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface SocialProof {
  id: string;
  proof_type: 'testimonial' | 'review_aggregate' | 'trust_score' | 'social_media' | 'press_mention';
  title: string;
  content: string;
  author_name?: string;
  author_title?: string;
  rating?: number;
  display_order?: number;
  featured?: boolean;
  is_verified?: boolean;
}

export const seoService = {
  // ========== SEO Pages ==========

  async getAllSeoPages(): Promise<SeoPage[]> {
    const { data, error } = await supabase
      .from('seo_pages')
      .select('*')
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getSeoPageByPath(path: string): Promise<SeoPage | null> {
    const { data, error } = await supabase
      .from('seo_pages')
      .select('*')
      .eq('page_path', path)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createSeoPage(seoPage: Omit<SeoPage, 'id'>): Promise<SeoPage> {
    const { data, error } = await supabase.from('seo_pages').insert([seoPage]).select().single();

    if (error) throw error;
    return data;
  },

  async updateSeoPage(id: string, updates: Partial<SeoPage>): Promise<SeoPage> {
    const { data, error } = await supabase
      .from('seo_pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSeoPage(id: string): Promise<void> {
    const { error } = await supabase.from('seo_pages').delete().eq('id', id);

    if (error) throw error;
  },

  async calculateSeoScore(pageId: string): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_seo_score', { page_uuid: pageId });

    if (error) throw error;
    return data || 0;
  },

  async generateSitemapData(): Promise<any[]> {
    const { data, error } = await supabase.rpc('generate_sitemap_data');

    if (error) throw error;
    return data || [];
  },

  // ========== Trust Badges ==========

  async getAllTrustBadges(): Promise<TrustBadge[]> {
    const { data, error } = await supabase
      .from('trust_badges')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  async getTrustBadgesByLocation(location: string): Promise<TrustBadge[]> {
    const { data, error } = await supabase
      .from('trust_badges')
      .select('*')
      .contains('display_locations', [location])
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  async createTrustBadge(badge: Omit<TrustBadge, 'id'>): Promise<TrustBadge> {
    const { data, error } = await supabase.from('trust_badges').insert([badge]).select().single();

    if (error) throw error;
    return data;
  },

  async updateTrustBadge(id: string, updates: Partial<TrustBadge>): Promise<TrustBadge> {
    const { data, error } = await supabase
      .from('trust_badges')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTrustBadge(id: string): Promise<void> {
    const { error } = await supabase.from('trust_badges').delete().eq('id', id);

    if (error) throw error;
  },

  // ========== Social Proofs ==========

  async getAllSocialProofs(): Promise<SocialProof[]> {
    const { data, error } = await supabase
      .from('social_proofs')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  async getFeaturedSocialProofs(): Promise<SocialProof[]> {
    const { data, error } = await supabase
      .from('social_proofs')
      .select('*')
      .eq('is_active', true)
      .eq('featured', true)
      .order('display_order')
      .limit(5);

    if (error) throw error;
    return data || [];
  },

  async getSocialProofsByType(type: string): Promise<SocialProof[]> {
    const { data, error } = await supabase
      .from('social_proofs')
      .select('*')
      .eq('proof_type', type)
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  async createSocialProof(proof: Omit<SocialProof, 'id'>): Promise<SocialProof> {
    const { data, error } = await supabase.from('social_proofs').insert([proof]).select().single();

    if (error) throw error;
    return data;
  },

  async updateSocialProof(id: string, updates: Partial<SocialProof>): Promise<SocialProof> {
    const { data, error } = await supabase
      .from('social_proofs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSocialProof(id: string): Promise<void> {
    const { error } = await supabase.from('social_proofs').delete().eq('id', id);

    if (error) throw error;
  },

  // ========== SEO Analytics ==========

  async getSeoAnalytics(pageId: string, startDate?: Date, endDate?: Date) {
    let query = supabase.from('seo_analytics').select('*').eq('seo_page_id', pageId);

    if (startDate) {
      query = query.gte('period_start', startDate.toISOString().split('T')[0]);
    }

    if (endDate) {
      query = query.lte('period_end', endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query.order('period_start', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTotalAnalytics() {
    const { data, error } = await supabase
      .from('seo_analytics')
      .select('page_views, unique_visitors, organic_traffic, conversions');

    if (error) throw error;

    return {
      totalPageViews:
        (data as any[] | null)?.reduce((sum: number, row: any) => sum + (row.page_views || 0), 0) ||
        0,
      totalVisitors:
        (data as any[] | null)?.reduce(
          (sum: number, row: any) => sum + (row.unique_visitors || 0),
          0
        ) || 0,
      totalOrganicTraffic:
        (data as any[] | null)?.reduce(
          (sum: number, row: any) => sum + (row.organic_traffic || 0),
          0
        ) || 0,
      totalConversions:
        (data as any[] | null)?.reduce(
          (sum: number, row: any) => sum + (row.conversions || 0),
          0
        ) || 0,
    };
  },
};
