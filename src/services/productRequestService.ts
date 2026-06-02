import { supabase } from '@/lib/supabase/client';

const STORAGE_KEY = 'kamaro_product_requests';
const DESCRIPTION_PREFIX = 'BROKER_REQUEST::';

export type ProductRequestStatus = 'new' | 'reviewing' | 'quoted' | 'sourced' | 'closed';

export interface ProductRequest {
  id: string;
  requestNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  productName: string;
  quantity: number;
  budget?: string;
  productLink?: string;
  notes?: string;
  status: ProductRequestStatus;
  source: 'supabase' | 'guest';
  createdAt: string;
}

export interface CreateProductRequestInput {
  customerName: string;
  phone: string;
  email?: string;
  productName: string;
  quantity: number;
  budget?: string;
  productLink?: string;
  notes?: string;
}

function generateRequestNumber() {
  return `SRC-${Date.now().toString().slice(-8)}`;
}

function serializeDescription(input: CreateProductRequestInput, requestNumber: string) {
  return `${DESCRIPTION_PREFIX}${JSON.stringify({
    requestNumber,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email || '',
    productName: input.productName,
    quantity: input.quantity,
    budget: input.budget || '',
    productLink: input.productLink || '',
    notes: input.notes || '',
  })}`;
}

function parseDescription(description: string) {
  if (!description?.startsWith(DESCRIPTION_PREFIX)) return null;

  try {
    return JSON.parse(description.slice(DESCRIPTION_PREFIX.length));
  } catch {
    return null;
  }
}

function readGuestRequests(): ProductRequest[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeGuestRequests(requests: ProductRequest[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function mapTicketToProductRequest(ticket: any): ProductRequest | null {
  const parsed = parseDescription(ticket.description || '');
  if (!parsed) return null;

  return {
    id: ticket.id,
    requestNumber: parsed.requestNumber || ticket.ticket_number || generateRequestNumber(),
    customerName: parsed.customerName || 'Customer',
    phone: parsed.phone || '',
    email: parsed.email || '',
    productName: parsed.productName || ticket.subject || 'Requested product',
    quantity: Number(parsed.quantity || 1),
    budget: parsed.budget || '',
    productLink: parsed.productLink || '',
    notes: parsed.notes || '',
    status: (ticket.status === 'open'
      ? 'new'
      : ticket.status === 'in_progress'
        ? 'reviewing'
        : ticket.status === 'waiting_customer'
          ? 'quoted'
          : ticket.status === 'resolved'
            ? 'sourced'
            : 'closed') as ProductRequestStatus,
    source: 'supabase',
    createdAt: ticket.created_at || new Date().toISOString(),
  };
}

export async function createProductRequest(input: CreateProductRequestInput): Promise<{
  data: ProductRequest | null;
  error: string | null;
}> {
  const requestNumber = generateRequestNumber();
  const now = new Date().toISOString();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: `Source request: ${input.productName}`,
          description: serializeDescription(input, requestNumber),
          category: 'product',
          priority: 'medium',
          status: 'open',
        })
        .select()
        .single();

      if (!error && data) {
        const mapped = mapTicketToProductRequest(data);
        return { data: mapped, error: null };
      }
    }
  } catch {
    // Fall back to guest storage below.
  }

  const guestRequest: ProductRequest = {
    id: `guest-${Date.now()}`,
    requestNumber,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email || '',
    productName: input.productName,
    quantity: input.quantity,
    budget: input.budget || '',
    productLink: input.productLink || '',
    notes: input.notes || '',
    status: 'new',
    source: 'guest',
    createdAt: now,
  };

  const existingRequests = readGuestRequests();
  writeGuestRequests([guestRequest, ...existingRequests]);

  return { data: guestRequest, error: null };
}

export async function getProductRequests(): Promise<{
  data: ProductRequest[];
  error: string | null;
}> {
  const requests: ProductRequest[] = [];

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('category', 'product')
        .order('created_at', { ascending: false });

      if (!error && data) {
        requests.push(...data.map(mapTicketToProductRequest).filter(Boolean) as ProductRequest[]);
      }
    }
  } catch {
    // Ignore and merge guest requests below.
  }

  return { data: [...requests, ...readGuestRequests()], error: null };
}
