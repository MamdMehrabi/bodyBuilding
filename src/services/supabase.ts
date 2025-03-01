import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

// These would typically come from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let supabase: ReturnType<typeof createClient<Database>> | null = null

export const createSupabaseClient = () => {
  if (!supabase) {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}

export const getSupabaseClient = () => {
  if (!supabase) {
    return createSupabaseClient()
  }
  return supabase
}