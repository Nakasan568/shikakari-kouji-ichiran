import React, { useState } from 'react'

interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onClear: () => void
  label?: string
  disabled?: boolean
}

export default function DateRangePicker({
  startDate = '',
  endDate = '',
  onStartDateChange,
  onEndDateChange,
  onClear,
  label = '日付範囲',
  disabled = false
}: DateRangePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const hasDateRange = startDate || endDate

  const getQuickDateRange = (type: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const today = new Date()
    const start = new Date()
    const end = new Date()

    switch (type) {
      case 'today':
        // 今日
        break
      case 'week':
        // 今週（月曜日から日曜日）
        const dayOfWeek = today.getDay()
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        start.setDate(today.getDate() + mondayOffset)
        end.setDate(start.getDate() + 6)
        break
      case 'month':
        // 今月
        start.setDate(1)
        end.setMonth(end.getMonth() + 1, 0)
        break
      case 'quarter':
        // 今四半期
        const quarter = Math.floor(today.getMonth() / 3)
        start.setMonth(quarter * 3, 1)
        end.setMonth(quarter * 3 + 3, 0)
        break
      case 'year':
        // 今年
        start.setMonth(0, 1)
        end.setMonth(11, 31)
        break
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  }

  const handleQuickSelect = (type: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const { start, end } = getQuickDateRange(type)
    onStartDateChange(start)
    onEndDateChange(end)
  }

  const handleClear = () => {
    onStartDateChange('')
    onEndDateChange('')
    onClear()
  }

  return (
    <div className="relative">
      {/* メインボタン */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:bg-gray-50'
        } ${hasDateRange ? 'border-blue-300 bg-blue-50' : ''}`}
      >
        <div className="flex items-center space-x-2">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={hasDateRange ? 'text-blue-900 font-medium' : 'text-gray-700'}>
            {hasDateRange 
              ? `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`
              : label
            }
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {hasDateRange && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg
            className={`h-4 w-4 text-gray-400 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* ドロップダウンパネル */}
      {isExpanded && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-4 space-y-4">
            {/* クイック選択ボタン */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                クイック選択
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSelect('today')}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  今日
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('week')}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  今週
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('month')}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  今月
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('quarter')}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  今四半期
                </button>
              </div>
            </div>

            {/* 日付入力 */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  開始日
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  終了日
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                クリア
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                適用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}