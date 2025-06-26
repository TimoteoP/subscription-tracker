import { createBrowserClient } from '@supabase/ssr'

// Usa createBrowserClient invece del vecchio createClient
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)