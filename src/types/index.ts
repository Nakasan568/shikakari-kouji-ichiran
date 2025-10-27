// 型定義のエクスポート用インデックスファイル

// データベース関連の型
export type {
  Employee,
  Project,
  ProjectStatus,
  SearchFilters,
  ProjectFormData,
  ApiResponse,
  PaginationParams,
  SortParams
} from './database'

// Supabase関連の型
export type {
  SupabaseDatabase,
  EmployeeRow,
  EmployeeInsert,
  EmployeeUpdate,
  ProjectRow,
  ProjectInsert,
  ProjectUpdate,
  SupabaseError,
  SupabaseResponse,
  QueryOptions,
  RealtimeSubscription,
  AuthUser,
  AuthSession,
  AuthError
} from './supabase'

// 共通の型
export type {
  Optional,
  RequiredFields,
  ApiError,
  ApiSuccess,
  ApiResult,
  LoadingState,
  AsyncState,
  FormField,
  FormErrors,
  TableColumn,
  TableProps,
  ModalProps,
  NotificationType,
  Notification,
  Permission,
  UserRole,
  AppSettings,
  ProjectStats,
  MonthlyStats,
  FilterOption,
  SearchResult,
  AppEvent,
  Configurable
} from './common'

// バリデーションスキーマから推論された型
export type {
  ProjectFormData as ValidatedProjectFormData,
  EmployeeFormData as ValidatedEmployeeFormData,
  SearchFiltersData as ValidatedSearchFiltersData,
  LoginFormData
} from '../schemas/validation'