import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../../types/database.types';

export const supabase: any = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Export createClient as an alias to createBrowserClient for compatibility
export const createClient = (): any =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
