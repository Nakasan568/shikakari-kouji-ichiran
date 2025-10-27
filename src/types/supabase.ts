// Supabase用の型定義

import type { Database } from './database-generated'
import type { Employee, Project, ProjectStatus } from './database'

// Supabaseのテーブル型定義
export interface SupabaseDatabase {
  public: {
    Tables: {
      employees: {
        Row: Employee
        Insert: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status: ProjectStatus
    }
  }
}

// Supabaseクエリ用のヘルパー型
export type EmployeeRow = SupabaseDatabase['public']['Tables']['employees']['Row']
export type EmployeeInsert = SupabaseDatabase['public']['Tables']['employees']['Insert']
export type EmployeeUpdate = SupabaseDatabase['public']['Tables']['employees']['Update']

export type ProjectRow = SupabaseDatabase['public']['Tables']['projects']['Row']
export type ProjectInsert = SupabaseDatabase['public']['Tables']['projects']['Insert']
export type ProjectUpdate = SupabaseDatabase['public']['Tables']['projects']['Update']

// Supabaseエラー型
export interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

// Supabaseレスポンス型
export interface SupabaseResponse<T> {
  data: T | null
  error: SupabaseError | null
  count?: number | null
  status: number
  statusText: string
}

// クエリオプション型
export interface QueryOptions {
  select?: string
  limit?: number
  offset?: number
  orderBy?: {
    column: string
    ascending?: boolean
  }
  filters?: Record<string, any>
}

// リアルタイム購読用の型
export interface RealtimeSubscription {
  channel: string
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  schema: 'public'
  table: 'employees' | 'projects'
}

// 認証関連の型
export interface AuthUser {
  id: string
  email?: string
  created_at: string
  updated_at: string
  last_sign_in_at?: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: AuthUser
}

export interface AuthError {
  message: string
  status?: number
}