import { supabase } from '@/lib/supabase/client';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  description: string;
  category: 'order' | 'product' | 'technical' | 'account' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  order_id?: string;
  assigned_to?: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal_note: boolean;
  attachments?: any[];
  created_at: string;
  user_profiles?: {
    full_name: string;
    email: string;
  };
}

export interface FAQ {
  id: string;
  category: 'ordering' | 'shipping' | 'returns' | 'payments' | 'technical' | 'account';
  question: string;
  answer: string;
  helpful_count: number;
  not_helpful_count: number;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category: SupportTicket['category'];
  priority?: SupportTicket['priority'];
  order_id?: string;
}

// Create a new support ticket
export async function createSupportTicket(
  data: CreateTicketData
): Promise<{ data: SupportTicket | null; error: any }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        subject: data.subject,
        description: data.description,
        category: data.category,
        priority: data.priority || 'medium',
        order_id: data.order_id,
        status: 'open',
      })
      .select()
      .single();

    return { data: ticket, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Get user's support tickets
export async function getUserTickets(): Promise<{ data: SupportTicket[] | null; error: any }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Get single ticket with messages
export async function getTicketDetails(ticketId: string): Promise<{
  data: { ticket: SupportTicket; messages: TicketMessage[] } | null;
  error: any;
}> {
  try {
    const [ticketResult, messagesResult] = await Promise.all([
      supabase.from('support_tickets').select('*').eq('id', ticketId).single(),
      supabase
        .from('ticket_messages')
        .select(
          `
          *,
          user_profiles (
            full_name,
            email
          )
        `
        )
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true }),
    ]);

    if (ticketResult.error) {
      return { data: null, error: ticketResult.error };
    }

    return {
      data: {
        ticket: ticketResult.data,
        messages: messagesResult.data || [],
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

// Add message to ticket
export async function addTicketMessage(
  ticketId: string,
  message: string
): Promise<{ data: TicketMessage | null; error: any }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        user_id: user.id,
        message,
        is_internal_note: false,
      })
      .select(
        `
        *,
        user_profiles (
          full_name,
          email
        )
      `
      )
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Get all FAQs by category
export async function getFAQsByCategory(
  category?: FAQ['category']
): Promise<{ data: FAQ[] | null; error: any }> {
  try {
    let query = supabase.from('faqs').select('*').eq('is_published', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('display_order', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Search FAQs
export async function searchFAQs(searchTerm: string): Promise<{ data: FAQ[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_published', true)
      .or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%`)
      .order('display_order', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Submit FAQ feedback
export async function submitFAQFeedback(
  faqId: string,
  isHelpful: boolean,
  feedbackText?: string
): Promise<{ data: any; error: any }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('faq_feedback')
      .upsert({
        faq_id: faqId,
        user_id: user.id,
        is_helpful: isHelpful,
        feedback_text: feedbackText,
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Update ticket status
export async function updateTicketStatus(
  ticketId: string,
  status: SupportTicket['status']
): Promise<{ data: SupportTicket | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', ticketId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}
