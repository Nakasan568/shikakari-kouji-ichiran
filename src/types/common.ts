// 共通で使用する型定義

// 基本的なユーティリティ型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// API関連の型
export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface ApiSuccess<T = any> {
  data: T
  message?: string
}

export type ApiResult<T = any> = ApiSuccess<T> | ApiError

// 状態管理用の型
export interface LoadingState {
  loading: boolean
  error: string | null
}

export interface AsyncState<T> extends LoadingState {
  data: T | null
}

// フォーム関連の型
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
}

export interface FormErrors {
  [key: string]: string | undefined
}

// テーブル関連の型
export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string
  render?: (value: any, row: T) => React.ReactNode
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  error?: string | null
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
  onRowClick?: (row: T) => void
}

// モーダル関連の型
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// 通知関連の型
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// 権限関連の型
export type Permission = 'read' | 'write' | 'delete' | 'admin'

export interface UserRole {
  id: string
  name: string
  permissions: Permission[]
}

// 設定関連の型
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'ja' | 'en'
  dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY'
  currency: 'JPY' | 'USD'
  itemsPerPage: number
}

// 統計・レポート関連の型
export interface ProjectStats {
  total: number
  planned: number
  inProgress: number
  completed: number
  totalContractAmount: number
  totalExecutionBudget: number
}

export interface MonthlyStats {
  month: string
  projectsStarted: number
  projectsCompleted: number
  contractAmount: number
  executionBudget: number
}

// 検索・フィルター関連の型
export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface SearchResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// イベント関連の型
export interface AppEvent {
  type: string
  payload?: any
  timestamp: Date
}

// 設定可能な型
export interface Configurable<T> {
  value: T
  defaultValue: T
  isModified: boolean
}