import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True once the two env vars are present (locally in .env.local, or in Vercel). */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * The Supabase client, or null when the project hasn't been configured yet.
 * The app shows a friendly setup screen while this is null.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
