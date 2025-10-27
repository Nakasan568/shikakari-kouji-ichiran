import React from 'react'
import { 
  formatCurrency, 
  formatDate, 
  formatDateTime, 
  formatDuration,
  calculateBudgetRatio,
  getStatusColor 
} from '../../utils/formatters'
import type { Project, ProjectStatus } from '../../types'

interface ProjectDetailProps {
  project: Project
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

export default function ProjectDetail({ 
  project, 
  onEdit, 
  onDelete, 
  onClose 
}: ProjectDetailProps) {


  return (
    <div className="bg-white shadow rounded-lg">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              工事詳細
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              工事ID: {project.id}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              編集
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              削除
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              閉じる
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 基本情報 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">工事名称</dt>
              <dd className="mt-1 text-sm text-gray-900 font-medium">{project.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">顧客名</dt>
              <dd className="mt-1 text-sm text-gray-900">{project.customer_name || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">担当者</dt>
              <dd className="mt-1 text-sm text-gray-900">{project.assignee}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">進捗ステータス</dt>
              <dd className="mt-1">
                {(() => {
                  const colors = getStatusColor(project.status)
                  return (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {project.status}
                    </span>
                  )
                })()}
              </dd>
            </div>
          </div>
        </div>

        {/* 金額情報 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">金額情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">契約金額</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 font-mono">
                {formatCurrency(project.contract_amount)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">実行予算</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 font-mono">
                {formatCurrency(project.execution_budget)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">予算比率</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {calculateBudgetRatio(project.execution_budget, project.contract_amount)}%
                {calculateBudgetRatio(project.execution_budget, project.contract_amount) > 100 && (
                  <span className="ml-2 text-xs text-red-600 font-normal">
                    (予算超過)
                  </span>
                )}
              </dd>
            </div>
          </div>
        </div>

        {/* スケジュール情報 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">スケジュール情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">着工予定日</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(project.planned_start_date)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">完工予定日</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(project.planned_completion_date)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">工期</dt>
              <dd className="mt-1 text-sm text-gray-900 font-medium">
                {formatDuration(project.planned_start_date, project.planned_completion_date)}
              </dd>
            </div>
          </div>
        </div>

        {/* 特記事項 */}
        {project.notes && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">特記事項</h3>
            <div className="text-sm text-gray-900 whitespace-pre-wrap">
              {project.notes}
            </div>
          </div>
        )}

        {/* システム情報 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">システム情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">作成日時</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDateTime(project.created_at)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">最終更新日時</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDateTime(project.updated_at)}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}