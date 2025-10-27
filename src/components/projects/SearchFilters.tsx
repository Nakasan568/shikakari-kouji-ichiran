import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { searchFiltersSchema } from '../../schemas/validation'
import { useEmployees } from '../../hooks/useEmployees'
import DateRangePicker from '../common/DateRangePicker'
import type { SearchFilters, ProjectStatus } from '../../types'

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  onClear: () => void
  initialFilters?: SearchFilters
}

const statusOptions: { value: ProjectStatus | ''; label: string }[] = [
  { value: '', label: '全て' },
  { value: '計画中', label: '計画中' },
  { value: '仕掛中', label: '仕掛中' },
  { value: '完工済', label: '完工済' }
]

export default function SearchFilters({ 
  onFiltersChange, 
  onClear, 
  initialFilters = {} 
}: SearchFiltersProps) {
  const { employees, loading: employeesLoading } = useEmployees()
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasActiveFilters, setHasActiveFilters] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<SearchFilters>({
    resolver: zodResolver(searchFiltersSchema),
    defaultValues: {
      projectId: initialFilters.projectId || '',
      projectName: initialFilters.projectName || '',
      assignee: initialFilters.assignee || '',
      status: initialFilters.status || '',
      completionDateFrom: initialFilters.completionDateFrom || '',
      completionDateTo: initialFilters.completionDateTo || ''
    }
  })

  // フォームの値を監視
  const watchedValues = watch()

  // フィルターの変更を検知してリアルタイム検索
  useEffect(() => {
    const subscription = watch((value) => {
      // 空の値を除外してフィルターオブジェクトを作成
      const filters: SearchFilters = {}
      
      if (value.projectId?.trim()) filters.projectId = value.projectId.trim()
      if (value.projectName?.trim()) filters.projectName = value.projectName.trim()
      if (value.assignee?.trim()) filters.assignee = value.assignee.trim()
      if (value.status) filters.status = value.status as ProjectStatus
      if (value.completionDateFrom) filters.completionDateFrom = value.completionDateFrom
      if (value.completionDateTo) filters.completionDateTo = value.completionDateTo

      // アクティブなフィルターがあるかチェック
      const hasFilters = Object.keys(filters).length > 0
      setHasActiveFilters(hasFilters)

      onFiltersChange(filters)
    })

    return () => subscription.unsubscribe()
  }, [watch, onFiltersChange])

  const handleClear = () => {
    reset({
      projectId: '',
      projectName: '',
      assignee: '',
      status: '',
      completionDateFrom: '',
      completionDateTo: ''
    })
    setHasActiveFilters(false)
    onClear()
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-900">
              🔍 検索・フィルター
            </h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                フィルター適用中
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={handleClear}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                クリア
              </button>
            )}
            <button
              onClick={toggleExpanded}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <svg
                className={`h-5 w-5 transform transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 基本検索（常に表示） */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 工事名称検索 */}
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
              工事名称
            </label>
            <input
              {...register('projectName')}
              type="text"
              placeholder="工事名称で検索..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* 担当者検索 */}
          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
              担当者
            </label>
            <select
              {...register('assignee')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={employeesLoading}
            >
              <option value="">全ての担当者</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.name}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          {/* ステータス検索 */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              進捗ステータス
            </label>
            <select
              {...register('status')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 詳細検索（展開時のみ表示） */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-200">
          <div className="pt-4 space-y-4">
            {/* 工事ID検索 */}
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                工事ID
              </label>
              <input
                {...register('projectId')}
                type="text"
                placeholder="工事IDで検索..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-600">{errors.projectId.message}</p>
              )}
            </div>

            {/* 完工予定日範囲 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                完工予定日
              </label>
              <DateRangePicker
                startDate={watchedValues.completionDateFrom || ''}
                endDate={watchedValues.completionDateTo || ''}
                onStartDateChange={(date) => setValue('completionDateFrom', date)}
                onEndDateChange={(date) => setValue('completionDateTo', date)}
                onClear={() => {
                  setValue('completionDateFrom', '')
                  setValue('completionDateTo', '')
                }}
                label="完工予定日を選択"
              />
              {(errors.completionDateFrom || errors.completionDateTo) && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.completionDateFrom?.message || errors.completionDateTo?.message}
                </p>
              )}
            </div>

            {/* 検索結果の統計情報 */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>リアルタイム検索が有効です</span>
                <div className="flex items-center space-x-4">
                  <span>
                    アクティブフィルター: {Object.keys(watchedValues).filter(key => 
                      watchedValues[key as keyof SearchFilters]
                    ).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}