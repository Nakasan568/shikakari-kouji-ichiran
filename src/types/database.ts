// データベーステーブルの型定義

export interface Employee {
  id: string
  name: string
  email?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  customer_name?: string
  assignee: string
  contract_amount: number
  execution_budget: number
  planned_start_date?: string
  planned_completion_date?: string
  status: ProjectStatus
  notes?: string
  created_at: string
  updated_at: string
}

// 進捗ステータスの型定義
export type ProjectStatus = '計画中' | '仕掛中' | '完工済'

// 検索・フィルター用の型定義
export interface SearchFilters {
  projectId?: string
  projectName?: string
  assignee?: string
  status?: ProjectStatus
  completionDateFrom?: string
  completionDateTo?: string
}

// フォーム用の型定義（新規作成・編集用）
export interface ProjectFormData {
  name: string
  customer_name?: string
  assignee: string
  contract_amount: number
  execution_budget: number
  planned_start_date?: string
  planned_completion_date?: string
  status: ProjectStatus
  notes?: string
}

// API レスポンス用の型定義
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

// ページネーション用の型定義
export interface PaginationParams {
  page: number
  limit: number
  total?: number
}

// ソート用の型定義
export interface SortParams {
  field: keyof Project
  direction: 'asc' | 'desc'
}