import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'app-auth-token',
    debug: process.env.NODE_ENV === 'development'
  },
  global: {
    fetch: (...args) => {
      const [url, config] = args;
      return fetch(url, {
        ...config,
        credentials: 'include'
      });
    }
  }
})

// Bağlantı durumunu kontrol eden yardımcı fonksiyon
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}
