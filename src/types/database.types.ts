export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type GenericTable = {
  Row: Record<string, any>;
  Insert: Record<string, any>;
  Update: Record<string, any>;
  Relationships?: Array<{
    foreignKeyName: string;
    columns: string[];
    referencedRelation: string;
    referencedColumns: string[];
  }>;
};

type GenericFunction = {
  Args: Record<string, any>;
  Returns: any;
};

export interface Database {
  public: {
    Tables: {
      [key: string]: GenericTable;
      products: GenericTable;
      stock_movements: GenericTable;
      stock_alert_configs: GenericTable;
      stock_alerts: GenericTable;
      categories: GenericTable;
      product_categories: GenericTable;
      product_likes: GenericTable;
      product_reviews: GenericTable;
      review_helpful_votes: GenericTable;
      orders: GenericTable;
      order_items: GenericTable;
      order_status_history: GenericTable;
      wishlist_items: GenericTable;
      wishlist_categories: GenericTable;
      wishlist_item_categories: GenericTable;
      price_alerts: GenericTable;
      user_rewards: GenericTable;
      reward_transactions: GenericTable;
      referrals: GenericTable;
      discount_redemptions: GenericTable;
      reward_config: GenericTable;
      business_settings: GenericTable;
      rwanda_addresses: GenericTable;
      customer_preferences: GenericTable;
      product_recommendations: GenericTable;
      consultation_bookings: GenericTable;
      product_comparison_sessions: GenericTable;
      admin_audit_logs: GenericTable;
      admin_sessions: GenericTable;
      password_reset_tokens: GenericTable;
      seo_pages: GenericTable;
      trust_badges: GenericTable;
      social_proofs: GenericTable;
      seo_analytics: GenericTable;
      support_tickets: GenericTable;
      ticket_messages: GenericTable;
      faqs: GenericTable;
      faq_feedback: GenericTable;
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: 'customer' | 'admin' | 'super_admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'customer' | 'admin' | 'super_admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'customer' | 'admin' | 'super_admin';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, any>;
      };
    };
    Functions: {
      [key: string]: GenericFunction;
      generate_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      update_order_status: {
        Args: {
          p_order_id: string;
          p_order_status: string;
          p_shipping_status: string;
          p_tracking_number?: string | null;
          p_notes?: string | null;
        };
        Returns: void;
      };
      generate_sitemap_data: {
        Args: Record<string, never>;
        Returns: Json[];
      };
      calculate_seo_score: {
        Args: {
          page_uuid: string;
        };
        Returns: number;
      };
      log_admin_action: {
        Args: {
          p_action: string;
          p_resource_type?: string | null;
          p_resource_id?: string | null;
          p_details?: Json | null;
        };
        Returns: string;
      };
      award_points: {
        Args: {
          p_user_id: string;
          p_points: number;
          p_transaction_type: string;
          p_description: string;
          p_reference_id?: string | null;
          p_reference_type?: string | null;
        };
        Returns: string;
      };
      cleanup_expired_password_reset_tokens: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      [key: string]: string;
    };
    CompositeTypes: {
      [key: string]: never;
    };
  };
}
