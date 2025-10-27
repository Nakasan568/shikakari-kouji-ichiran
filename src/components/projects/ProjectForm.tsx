import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema } from '../../schemas/validation'
import { useEmployees } from '../../hooks/useEmployees'
import type { ProjectFormData, Project, ProjectStatus } from '../../types'

interface ProjectFormProps {
  project?: Project // 編集時に渡される既存のプロジェクトデータ
  onSubmit: (data: ProjectFormData) => Promise<{ error: string | null }>
  onCancel: () => void
  loading?: boolean
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: '計画中', label: '計画中' },
  { value: '仕掛中', label: '仕掛中' },
  { value: '完工済', label: '完工済' }
]

export default function ProjectForm({ 
  project, 
  onSubmit, 
  onCancel, 
  loading = false 
}: ProjectFormProps) {
  const { employees, loading: employeesLoading } = useEmployees()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEditing = !!project

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project ? {
      name: project.name,
      customer_name: project.customer_name || '',
      assignee: project.assignee,
      contract_amount: project.contract_amount,
      execution_budget: project.execution_budget,
      planned_start_date: project.planned_start_date || '',
      planned_completion_date: project.planned_completion_date || '',
      status: project.status,
      notes: project.notes || ''
    } : {
      name: '',
      customer_name: '',
      assignee: '',
      contract_amount: 0,
      execution_budget: 0,
      planned_start_date: '',
      planned_completion_date: '',
      status: '計画中',
      notes: ''
    }
  })

  const contractAmount = watch('contract_amount')

  const handleFormSubmit = async (data: ProjectFormData) => {
    setSubmitError(null)
    
    try {
      const result = await onSubmit(data)
      if (result.error) {
        setSubmitError(result.error)
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    }
  }

  const formatNumberInput = (value: string): number => {
    const numericValue = value.replace(/[^\d]/g, '')
    return numericValue ? parseInt(numericValue, 10) : 0
  }

  const isFormLoading = loading || isSubmitting || employeesLoading

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? '工事情報の編集' : '新規工事登録'}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {isEditing ? '工事情報を更新してください' : '新しい工事の情報を入力してください'}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
        {/* エラー表示 */}
        {submitError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  エラーが発生しました
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {submitError}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 基本情報セクション */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 工事名称 */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                工事名称 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.name ? 'border-red-300' : ''
                }`}
                placeholder="例: 新宿オフィスビル建設"
                disabled={isFormLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* 顧客名 */}
            <div>
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
                顧客名
              </label>
              <input
                {...register('customer_name')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="例: 株式会社ABC商事"
                disabled={isFormLoading}
              />
              {errors.customer_name && (
                <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>
              )}
            </div>

            {/* 担当者 */}
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">
                担当者 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('assignee')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.assignee ? 'border-red-300' : ''
                }`}
                disabled={isFormLoading}
              >
                <option value="">担当者を選択してください</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.name}>
                    {employee.name}
                  </option>
                ))}
              </select>
              {errors.assignee && (
                <p className="mt-1 text-sm text-red-600">{errors.assignee.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 金額情報セクション */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">金額情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 契約金額 */}
            <div>
              <label htmlFor="contract_amount" className="block text-sm font-medium text-gray-700">
                契約金額 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">¥</span>
                </div>
                <input
                  {...register('contract_amount', {
                    setValueAs: formatNumberInput
                  })}
                  type="text"
                  className={`block w-full pl-7 pr-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.contract_amount ? 'border-red-300' : ''
                  }`}
                  placeholder="50000000"
                  disabled={isFormLoading}
                  onChange={(e) => {
                    const value = formatNumberInput(e.target.value)
                    setValue('contract_amount', value)
                    e.target.value = value.toLocaleString()
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">円</span>
                </div>
              </div>
              {errors.contract_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.contract_amount.message}</p>
              )}
            </div>

            {/* 実行予算 */}
            <div>
              <label htmlFor="execution_budget" className="block text-sm font-medium text-gray-700">
                実行予算 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">¥</span>
                </div>
                <input
                  {...register('execution_budget', {
                    setValueAs: formatNumberInput
                  })}
                  type="text"
                  className={`block w-full pl-7 pr-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.execution_budget ? 'border-red-300' : ''
                  }`}
                  placeholder="45000000"
                  disabled={isFormLoading}
                  onChange={(e) => {
                    const value = formatNumberInput(e.target.value)
                    setValue('execution_budget', value)
                    e.target.value = value.toLocaleString()
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">円</span>
                </div>
              </div>
              {errors.execution_budget && (
                <p className="mt-1 text-sm text-red-600">{errors.execution_budget.message}</p>
              )}
              {contractAmount > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  契約金額の{Math.round((watch('execution_budget') / contractAmount) * 100)}%
                </p>
              )}
            </div>
          </div>
        </div>

        {/* スケジュール情報セクション */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">スケジュール情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 着工予定日 */}
            <div>
              <label htmlFor="planned_start_date" className="block text-sm font-medium text-gray-700">
                着工予定日
              </label>
              <input
                {...register('planned_start_date')}
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isFormLoading}
              />
              {errors.planned_start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.planned_start_date.message}</p>
              )}
            </div>

            {/* 完工予定日 */}
            <div>
              <label htmlFor="planned_completion_date" className="block text-sm font-medium text-gray-700">
                完工予定日
              </label>
              <input
                {...register('planned_completion_date')}
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isFormLoading}
              />
              {errors.planned_completion_date && (
                <p className="mt-1 text-sm text-red-600">{errors.planned_completion_date.message}</p>
              )}
            </div>

            {/* 進捗ステータス */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                進捗ステータス <span className="text-red-500">*</span>
              </label>
              <select
                {...register('status')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.status ? 'border-red-300' : ''
                }`}
                disabled={isFormLoading}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 特記事項セクション */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">特記事項</h3>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              特記事項
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="工事に関する特記事項があれば記入してください"
              disabled={isFormLoading}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>
        </div>

        {/* フォームアクション */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isFormLoading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isFormLoading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isFormLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isFormLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                {isEditing ? '更新中...' : '登録中...'}
              </>
            ) : (
              isEditing ? '更新' : '登録'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}