import { z } from 'zod'
import type { ProjectStatus } from '../types/database'

// 進捗ステータスのスキーマ
export const projectStatusSchema = z.enum(['計画中', '仕掛中', '完工済']) as z.ZodEnum<[ProjectStatus, ...ProjectStatus[]]>

// 工事データのバリデーションスキーマ
export const projectSchema = z.object({
  name: z
    .string()
    .min(1, '工事名称は必須です')
    .max(255, '工事名称は255文字以内で入力してください'),
  
  customer_name: z
    .string()
    .max(255, '顧客名は255文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  
  assignee: z
    .string()
    .min(1, '担当者は必須です')
    .max(255, '担当者名は255文字以内で入力してください'),
  
  contract_amount: z
    .number({
      required_error: '契約金額は必須です',
      invalid_type_error: '契約金額は数値で入力してください'
    })
    .int('契約金額は整数で入力してください')
    .min(0, '契約金額は0以上で入力してください')
    .max(999999999999, '契約金額が大きすぎます'),
  
  execution_budget: z
    .number({
      required_error: '実行予算は必須です',
      invalid_type_error: '実行予算は数値で入力してください'
    })
    .int('実行予算は整数で入力してください')
    .min(0, '実行予算は0以上で入力してください')
    .max(999999999999, '実行予算が大きすぎます'),
  
  planned_start_date: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true
      return !isNaN(Date.parse(date))
    }, '有効な日付を入力してください'),
  
  planned_completion_date: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true
      return !isNaN(Date.parse(date))
    }, '有効な日付を入力してください'),
  
  status: projectStatusSchema,
  
  notes: z
    .string()
    .max(1000, '特記事項は1000文字以内で入力してください')
    .optional()
    .or(z.literal(''))
}).refine((data) => {
  // 着工予定日と完工予定日の関係をチェック
  if (data.planned_start_date && data.planned_completion_date) {
    const startDate = new Date(data.planned_start_date)
    const endDate = new Date(data.planned_completion_date)
    return startDate <= endDate
  }
  return true
}, {
  message: '完工予定日は着工予定日以降の日付を入力してください',
  path: ['planned_completion_date']
}).refine((data) => {
  // 契約金額と実行予算の関係をチェック（実行予算が契約金額を大幅に超えないか）
  if (data.contract_amount > 0 && data.execution_budget > 0) {
    return data.execution_budget <= data.contract_amount * 1.5 // 150%まで許可
  }
  return true
}, {
  message: '実行予算が契約金額に対して過大です（契約金額の150%以内で入力してください）',
  path: ['execution_budget']
})

// 社員データのバリデーションスキーマ
export const employeeSchema = z.object({
  name: z
    .string()
    .min(1, '社員名は必須です')
    .max(255, '社員名は255文字以内で入力してください'),
  
  email: z
    .string()
    .email('有効なメールアドレスを入力してください')
    .max(255, 'メールアドレスは255文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  
  is_active: z.boolean().default(true)
})

// 検索フィルターのバリデーションスキーマ
export const searchFiltersSchema = z.object({
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  assignee: z.string().optional(),
  status: projectStatusSchema.optional(),
  completionDateFrom: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true
      return !isNaN(Date.parse(date))
    }, '有効な日付を入力してください'),
  completionDateTo: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true
      return !isNaN(Date.parse(date))
    }, '有効な日付を入力してください')
}).refine((data) => {
  // 日付範囲の妥当性をチェック
  if (data.completionDateFrom && data.completionDateTo) {
    const fromDate = new Date(data.completionDateFrom)
    const toDate = new Date(data.completionDateTo)
    return fromDate <= toDate
  }
  return true
}, {
  message: '終了日は開始日以降の日付を入力してください',
  path: ['completionDateTo']
})

// ログインフォームのバリデーションスキーマ
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  
  password: z
    .string()
    .min(1, 'パスワードは必須です')
    .min(6, 'パスワードは6文字以上で入力してください')
})

// 型推論用のエクスポート
export type ProjectFormData = z.infer<typeof projectSchema>
export type EmployeeFormData = z.infer<typeof employeeSchema>
export type SearchFiltersData = z.infer<typeof searchFiltersSchema>
export type LoginFormData = z.infer<typeof loginSchema>