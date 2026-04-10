import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface ProductRecommendation {
  name: string;
  price: number;
  imageUrl: string;
  url: string;
}

interface CartItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface ProductRecommendationEmailData {
  customerName: string;
  products: ProductRecommendation[];
  shopUrl: string;
  unsubscribeUrl: string;
}

export interface AbandonedCartEmailData {
  customerName: string;
  cartItems: CartItem[];
  cartTotal: number;
  checkoutUrl: string;
  supportUrl: string;
  discountCode?: string;
  discountPercent?: number;
}

export interface PostPurchaseEmailData {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  estimatedDelivery: string;
  orderItems: OrderItem[];
  trackingNumber?: string;
  trackingUrl?: string;
  deliveryDays: number;
  orderDetailsUrl: string;
  reviewUrl: string;
  supportUrl: string;
}

export interface GenericEmailPayload {
  to: string;
  subject: string;
  html: string;
}

export const emailService = {
  /**
   * Send personalized product recommendations email
   */
  async sendProductRecommendations(
    toEmail: string,
    data: ProductRecommendationEmailData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'product_recommendations',
          to: toEmail,
          data,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Send abandoned cart recovery email
   */
  async sendAbandonedCartEmail(
    toEmail: string,
    data: AbandonedCartEmailData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'abandoned_cart',
          to: toEmail,
          data,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Send post-purchase follow-up email
   */
  async sendPostPurchaseEmail(
    toEmail: string,
    data: PostPurchaseEmailData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'post_purchase',
          to: toEmail,
          data,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async sendEmail(payload: GenericEmailPayload): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'generic',
          to: payload.to,
          data: {
            subject: payload.subject,
            html: payload.html,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
