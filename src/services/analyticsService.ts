import { supabase } from '@/lib/supabase/client';

type AnalyticsOrderRow = {
  total?: number | null;
  created_at?: string | null;
  order_status?: string | null;
  user_id?: string | null;
  payment_method?: string | null;
};

type AnalyticsOrderItemRow = {
  product_name?: string | null;
  quantity?: number | null;
  total_price?: number | null;
};

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customerGrowth: number;
  conversionGrowth: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface PaymentMethodData {
  method: string;
  total: number;
  count: number;
  successRate: number;
}

export interface ProductPopularity {
  productName: string;
  totalSold: number;
  revenue: number;
}

export interface CustomerBehavior {
  totalSessions: number;
  averageSessionDuration: number;
  cartAbandonmentRate: number;
  repeatPurchaseRate: number;
  newCustomers: number;
  returningCustomers: number;
}

class AnalyticsService {
  async getAnalyticsSummary(startDate: string, endDate: string): Promise<AnalyticsSummary> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total, created_at, order_status, user_id')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const totalRevenue =
        (orders as AnalyticsOrderRow[] | null)?.reduce(
          (sum: number, order: AnalyticsOrderRow) => sum + Number(order.total || 0),
          0
        ) || 0;
      const totalOrders = orders?.length || 0;
      const uniqueCustomers = new Set(
        (orders as AnalyticsOrderRow[] | null)
          ?.map((o: AnalyticsOrderRow) => o.user_id)
          .filter(Boolean)
      ).size;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate growth rates (compared to previous period)
      const periodDays = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const previousStart = new Date(
        new Date(startDate).getTime() - periodDays * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];
      const previousEnd = startDate;

      const { data: previousOrders } = await supabase
        .from('orders')
        .select('total, user_id')
        .gte('created_at', previousStart)
        .lte('created_at', previousEnd);

      const previousRevenue =
        (previousOrders as AnalyticsOrderRow[] | null)?.reduce(
          (sum: number, order: AnalyticsOrderRow) => sum + Number(order.total || 0),
          0
        ) || 0;
      const previousOrderCount = previousOrders?.length || 0;
      const previousCustomers = new Set(
        (previousOrders as AnalyticsOrderRow[] | null)
          ?.map((o: AnalyticsOrderRow) => o.user_id)
          .filter(Boolean)
      ).size;

      const revenueGrowth =
        previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const ordersGrowth =
        previousOrderCount > 0
          ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100
          : 0;
      const customerGrowth =
        previousCustomers > 0
          ? ((uniqueCustomers - previousCustomers) / previousCustomers) * 100
          : 0;

      // Calculate conversion rate (orders completed / total orders)
      const completedOrders =
        (orders as AnalyticsOrderRow[] | null)?.filter(
          (o: AnalyticsOrderRow) => o.order_status === 'delivered'
        ).length || 0;
      const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      const previousCompleted =
        previousOrders?.filter((o: any) => o.order_status === 'delivered').length || 0;
      const previousConversion =
        previousOrderCount > 0 ? (previousCompleted / previousOrderCount) * 100 : 0;
      const conversionGrowth =
        previousConversion > 0
          ? ((conversionRate - previousConversion) / previousConversion) * 100
          : 0;

      return {
        totalRevenue,
        totalOrders,
        totalCustomers: uniqueCustomers,
        averageOrderValue,
        conversionRate,
        revenueGrowth,
        ordersGrowth,
        customerGrowth,
        conversionGrowth,
      };
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      throw error;
    }
  }

  async getRevenueData(startDate: string, endDate: string): Promise<RevenueData[]> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const revenueByDate = new Map<string, { revenue: number; count: number }>();

      (orders as AnalyticsOrderRow[] | null)?.forEach((order: AnalyticsOrderRow) => {
        const date = order.created_at?.split('T')[0] || '';
        const existing = revenueByDate.get(date) || { revenue: 0, count: 0 };
        revenueByDate.set(date, {
          revenue: existing.revenue + Number(order.total || 0),
          count: existing.count + 1,
        });
      });

      return Array.from(revenueByDate.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.count,
      }));
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return [];
    }
  }

  async getPaymentMethodStats(startDate: string, endDate: string): Promise<PaymentMethodData[]> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('payment_method, total, order_status')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const paymentStats = new Map<string, { total: number; count: number; successful: number }>();

      (orders as AnalyticsOrderRow[] | null)?.forEach((order: AnalyticsOrderRow) => {
        const method = order.payment_method || 'unknown';
        const existing = paymentStats.get(method) || { total: 0, count: 0, successful: 0 };
        paymentStats.set(method, {
          total: existing.total + Number(order.total || 0),
          count: existing.count + 1,
          successful: existing.successful + (order.order_status === 'delivered' ? 1 : 0),
        });
      });

      return Array.from(paymentStats.entries()).map(([method, data]) => ({
        method: method.toUpperCase(),
        total: data.total,
        count: data.count,
        successRate: data.count > 0 ? (data.successful / data.count) * 100 : 0,
      }));
    } catch (error) {
      console.error('Error fetching payment method stats:', error);
      return [];
    }
  }

  async getProductPopularity(
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<ProductPopularity[]> {
    try {
      const { data: items, error } = await supabase
        .from('order_items')
        .select('product_name, quantity, total_price, order_id, orders!inner(created_at)')
        .gte('orders.created_at', startDate)
        .lte('orders.created_at', endDate);

      if (error) throw error;

      const productStats = new Map<string, { sold: number; revenue: number }>();

      (items as AnalyticsOrderItemRow[] | null)?.forEach((item: AnalyticsOrderItemRow) => {
        const name = item.product_name || 'Unknown';
        const existing = productStats.get(name) || { sold: 0, revenue: 0 };
        productStats.set(name, {
          sold: existing.sold + (item.quantity || 0),
          revenue: existing.revenue + Number(item.total_price || 0),
        });
      });

      return Array.from(productStats.entries())
        .map(([productName, data]) => ({
          productName,
          totalSold: data.sold,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching product popularity:', error);
      return [];
    }
  }

  async getCustomerBehavior(startDate: string, endDate: string): Promise<CustomerBehavior> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('user_id, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const customerOrders = new Map<string, number>();
      (orders as AnalyticsOrderRow[] | null)?.forEach((order: AnalyticsOrderRow) => {
        const userId = order.user_id || 'anonymous';
        customerOrders.set(userId, (customerOrders.get(userId) || 0) + 1);
      });

      const repeatCustomers = Array.from(customerOrders.values()).filter(
        (count) => count > 1
      ).length;
      const totalCustomers = customerOrders.size;
      const repeatPurchaseRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

      // Estimate cart abandonment (simplified - would need cart tracking in real scenario)
      const completedOrders =
        (orders as AnalyticsOrderRow[] | null)?.filter(
          (o: AnalyticsOrderRow) => o.order_status === 'delivered'
        ).length || 0;
      const totalOrders = orders?.length || 0;
      const cartAbandonmentRate =
        totalOrders > 0 ? ((totalOrders - completedOrders) / totalOrders) * 100 : 0;

      return {
        totalSessions: totalOrders,
        averageSessionDuration: 5.2, // Mock data - would need session tracking
        cartAbandonmentRate,
        repeatPurchaseRate,
        newCustomers: totalCustomers - repeatCustomers,
        returningCustomers: repeatCustomers,
      };
    } catch (error) {
      console.error('Error fetching customer behavior:', error);
      return {
        totalSessions: 0,
        averageSessionDuration: 0,
        cartAbandonmentRate: 0,
        repeatPurchaseRate: 0,
        newCustomers: 0,
        returningCustomers: 0,
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
