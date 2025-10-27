import { createClient } from '@supabase/supabase-js'
import type { SupabaseDatabase } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 型安全なSupabaseクライアントを作成
export const supabase = createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 型安全なヘルパー関数
export const getTypedSupabaseClient = () => supabase