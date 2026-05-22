import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and ' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local — see .env.example for reference.'
  )
}

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!)
}
