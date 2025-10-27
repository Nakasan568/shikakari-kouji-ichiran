import React from 'react'
import { useResponsive } from '../../hooks/useResponsive'
import { formatCurrency, formatDateShort, getStatusColor } from '../../utils/formatters'
import type { Project, ProjectStatus, SortParams } from '../../types'

interface ResponsiveProjectTableProps {
  projects: Project[]
  sortParams: SortParams
  onSort: (field: keyof Project) => void
  onProjectSelect?: (project: Project) => void
  onProjectEdit?: (project: Project) => void
  onProjectDelete?: (project: Project) => void
}

export default function ResponsiveProjectTable({
  projects,
  sortParams,
  onSort,
  onProjectSelect,
  onProjectEdit,
  onProjectDelete
}: ResponsiveProjectTableProps) {
  const { isMobile } = useResponsive()

  const getRowColor = (status: ProjectStatus): string => {
    switch (status) {
      case '計画中':
        return 'bg-blue-50 hover:bg-blue-100'
      case '仕掛中':
        return 'bg-white hover:bg-gray-50'
      case '完工済':
        return 'bg-green-50 hover:bg-green-100'
      default:
        return 'bg-white hover:bg-gray-50'
    }
  }

  // モバイル表示用のカードコンポーネント
  const ProjectCard = ({ project }: { project: Project }) => {
    const colors = getStatusColor(project.status)
    
    return (
      <div 
        className={`${getRowColor(project.status)} border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer transition-colors fade-in`}
        onClick={() => onProjectSelect?.(project)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-base mb-1">
              {project.name}
            </h3>
            {project.customer_name && (
              <p className="text-sm text-gray-600 mb-2">
                {project.customer_name}
              </p>
            )}
          </div>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${colors.bg} ${colors.text} ${colors.border} ml-2`}>
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">担当者:</span>
            <span className="ml-1 font-medium">{project.assignee}</span>
          </div>
          <div>
            <span className="text-gray-500">契約金額:</span>
            <span className="ml-1 font-medium font-mono">
              {formatCurrency(project.contract_amount)}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">完工予定:</span>
            <span className="ml-1">
              {formatDateShort(project.planned_completion_date)}
            </span>
          </div>
        </div>

        {project.notes && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.notes}
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onProjectEdit?.(project)
            }}
            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-full transition-colors"
            title="編集"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onProjectDelete?.(project)
            }}
            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition-colors"
            title="削除"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // ソート可能なヘッダーコンポーネント
  const SortableHeader = ({ 
    field, 
    children 
  }: { 
    field: keyof Project
    children: React.ReactNode 
  }) => {
    const isActive = sortParams.field === field
    const direction = sortParams.direction

    return (
      <th
        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none transition-colors"
        onClick={() => onSort(field)}
      >
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          <div className="flex flex-col">
            <svg
              className={`h-3 w-3 ${
                isActive && direction === 'asc' ? 'text-blue-600' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <svg
              className={`h-3 w-3 -mt-1 ${
                isActive && direction === 'desc' ? 'text-blue-600' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </th>
    )
  }

  // モバイル表示
  if (isMobile) {
    return (
      <div className="space-y-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    )
  }

  // デスクトップ表示
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader field="name">
              工事名称
            </SortableHeader>
            <SortableHeader field="customer_name">
              顧客名
            </SortableHeader>
            <SortableHeader field="assignee">
              担当者
            </SortableHeader>
            <SortableHeader field="contract_amount">
              契約金額
            </SortableHeader>
            <SortableHeader field="status">
              進捗ステータス
            </SortableHeader>
            <SortableHeader field="planned_completion_date">
              完工予定日
            </SortableHeader>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => {
            const colors = getStatusColor(project.status)
            
            return (
              <tr
                key={project.id}
                className={`${getRowColor(project.status)} cursor-pointer transition-colors hover-lift`}
                onClick={() => onProjectSelect?.(project)}
              >
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {project.name}
                  </div>
                  {project.notes && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {project.notes}
                    </div>
                  )}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.customer_name || '-'}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.assignee}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {formatCurrency(project.contract_amount)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateShort(project.planned_completion_date)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onProjectEdit?.(project)
                      }}
                      className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded transition-colors"
                      title="編集"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onProjectDelete?.(project)
                      }}
                      className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded transition-colors"
                      title="削除"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}