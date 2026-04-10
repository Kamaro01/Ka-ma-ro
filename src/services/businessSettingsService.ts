import { supabase } from '@/lib/supabase/client';
const asList = <T>(data: unknown): T[] => (data ?? []) as T[];
const asOne = <T>(data: unknown): T | null => (data ?? null) as T | null;

export interface BusinessSettings {
  id: string;
  store_name: string;
  primary_language: 'en' | 'rw' | 'fr';
  business_hours_start: string;
  business_hours_end: string;
  support_email: string;
  support_whatsapp?: string;
  allow_cash_on_delivery: boolean;
  require_advance_payment: boolean;
  advance_payment_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface RwandaAddress {
  id: string;
  user_id: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village?: string;
  street_address?: string;
  phone_number: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerPreferences {
  id: string;
  user_id: string;
  preferred_language: 'en' | 'rw' | 'fr';
  preferred_contact_method?: string;
  notification_preferences: Record<string, boolean>;
  browsing_history: any[];
  engagement_score: number;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

export interface ConsultationBooking {
  id: string;
  user_id: string;
  booking_date: string;
  booking_time: string;
  consultation_type: string;
  product_id?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

class BusinessSettingsService {
  async getBusinessSettings(): Promise<BusinessSettings | null> {
    const { data, error } = await supabase.from('business_settings').select('*').single();

    if (error) {
      console.error('Error fetching business settings:', error);
      return null;
    }

    return asOne<BusinessSettings>(data);
  }

  async updateBusinessSettings(
    settings: Partial<BusinessSettings>
  ): Promise<BusinessSettings | null> {
    const { data, error } = await supabase
      .from('business_settings')
      .update(settings as any)
      .eq('id', settings.id!)
      .select()
      .single();

    if (error) {
      console.error('Error updating business settings:', error);
      return null;
    }

    return asOne<BusinessSettings>(data);
  }

  async getUserAddresses(userId: string): Promise<RwandaAddress[]> {
    const { data, error } = await supabase
      .from('rwanda_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }

    return asList<RwandaAddress>(data);
  }

  async addAddress(
    address: Omit<RwandaAddress, 'id' | 'created_at' | 'updated_at'>
  ): Promise<RwandaAddress | null> {
    const { data, error } = await supabase
      .from('rwanda_addresses')
      .insert([address] as any)
      .select()
      .single();

    if (error) {
      console.error('Error adding address:', error);
      return null;
    }

    return asOne<RwandaAddress>(data);
  }

  async updateAddress(id: string, updates: Partial<RwandaAddress>): Promise<RwandaAddress | null> {
    const { data, error } = await supabase
      .from('rwanda_addresses')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating address:', error);
      return null;
    }

    return asOne<RwandaAddress>(data);
  }

  async deleteAddress(id: string): Promise<boolean> {
    const { error } = await supabase.from('rwanda_addresses').delete().eq('id', id);

    if (error) {
      console.error('Error deleting address:', error);
      return false;
    }

    return true;
  }

  async getCustomerPreferences(userId: string): Promise<CustomerPreferences | null> {
    const { data, error } = await supabase
      .from('customer_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching customer preferences:', error);
      return null;
    }

    return asOne<CustomerPreferences>(data);
  }

  async updateCustomerPreferences(
    userId: string,
    preferences: Partial<CustomerPreferences>
  ): Promise<CustomerPreferences | null> {
    const { data, error } = await supabase
      .from('customer_preferences')
      .upsert({ user_id: userId, ...preferences } as any)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer preferences:', error);
      return null;
    }

    return asOne<CustomerPreferences>(data);
  }

  async getConsultationBookings(userId: string): Promise<ConsultationBooking[]> {
    const { data, error } = await supabase
      .from('consultation_bookings')
      .select('*, products(name, image_url)')
      .eq('user_id', userId)
      .order('booking_date', { ascending: true });

    if (error) {
      console.error('Error fetching consultation bookings:', error);
      return [];
    }

    return asList<ConsultationBooking>(data);
  }

  async createConsultationBooking(
    booking: Omit<ConsultationBooking, 'id' | 'created_at' | 'updated_at' | 'status'>
  ): Promise<ConsultationBooking | null> {
    const { data, error } = await supabase
      .from('consultation_bookings')
      .insert([{ ...booking, status: 'pending' }] as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating consultation booking:', error);
      return null;
    }

    return asOne<ConsultationBooking>(data);
  }

  async updateConsultationBooking(
    id: string,
    updates: Partial<ConsultationBooking>
  ): Promise<ConsultationBooking | null> {
    const { data, error } = await supabase
      .from('consultation_bookings')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating consultation booking:', error);
      return null;
    }

    return asOne<ConsultationBooking>(data);
  }

  async cancelConsultationBooking(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('consultation_bookings')
      .update({ status: 'cancelled' } as any)
      .eq('id', id);

    if (error) {
      console.error('Error cancelling consultation booking:', error);
      return false;
    }

    return true;
  }
}

export const businessSettingsService = new BusinessSettingsService();
