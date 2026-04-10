import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../../types/database.types';

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
}

function createMissingSupabaseClient(): any {
  const emptyResponse = Promise.resolve({ data: null, error: null });
  const emptyListResponse = Promise.resolve({ data: [], error: null });

  let query: any;

  query = new Proxy(() => query, {
    get(_target, property) {
      if (property === 'then') {
        return emptyResponse.then.bind(emptyResponse);
      }

      if (property === 'catch') {
        return emptyResponse.catch.bind(emptyResponse);
      }

      if (property === 'finally') {
        return emptyResponse.finally.bind(emptyResponse);
      }

      if (property === 'single' || property === 'maybeSingle') {
        return () => emptyResponse;
      }

      return () => query;
    },
    apply() {
      return query;
    },
  });

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => undefined } },
      }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      signUp: async () => ({ data: null, error: null }),
      resetPasswordForEmail: async () => ({ data: null, error: null }),
      updateUser: async () => ({ data: null, error: null }),
    },
    channel: () => query,
    from: () => query,
    functions: {
      invoke: async () => ({ data: null, error: null }),
    },
    removeChannel: () => undefined,
    rpc: () => emptyListResponse,
    storage: {
      from: () => ({
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: async () => ({ data: null, error: null }),
        upload: async () => ({ data: null, error: null }),
      }),
    },
  };
}

// Export createClient as an alias to createBrowserClient for compatibility
export const createClient = (): any => {
  const config = getSupabaseConfig();

  if (!config) {
    return createMissingSupabaseClient();
  }

  return createBrowserClient<Database>(config.supabaseUrl, config.supabaseAnonKey);
};

export const supabase: any = new Proxy(
  {},
  {
    get(_target, property) {
      return createClient()[property as keyof ReturnType<typeof createClient>];
    },
  }
);
