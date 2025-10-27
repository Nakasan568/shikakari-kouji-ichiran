import React, { useState } from 'react'
import { useProjects } from '../../hooks/useProjects'
import SearchFilters from './SearchFilters'
import Pagination from '../common/Pagination'
import ResponsiveProjectTable from './ResponsiveProjectTable'
import type { Project, ProjectStatus, SortParams, SearchFilters as SearchFiltersType } from '../../types'

interface ProjectListProps {
  onProjectSelect?: (project: Project) => void
  onProjectEdit?: (project: Project) => void
  onProjectDelete?: (project: Project) => void
}

export default function ProjectList({ 
  onProjectSelect, 
  onProjectEdit, 
  onProjectDelete 
}: ProjectListProps) {
  const [sortParams, setSortParams] = useState<SortParams>({
    field: 'created_at',
    direction: 'desc'
  })
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  const { 
    projects, 
    loading, 
    error, 
    total, 
    totalPages,
    refetch 
  } = useProjects({
    sort: sortParams,
    filters,
    page: currentPage,
    limit: itemsPerPage
  })

  const handleSort = (field: keyof Project) => {
    setSortParams(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters)
    setCurrentPage(1) // フィルター変更時は1ページ目に戻る
  }

  const handleClearFilters = () => {
    setFilters({})
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // 表示件数変更時は1ページ目に戻る
  }



  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">工事一覧</h2>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">工事データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">工事一覧</h2>
        </div>
        <div className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-700 font-medium">エラーが発生しました</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 検索・フィルターコンポーネント */}
      <SearchFilters
        onFiltersChange={handleFiltersChange}
        onClear={handleClearFilters}
        initialFilters={filters}
      />

      <div className="bg-white shadow rounded-lg">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            工事一覧 ({total}件)
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={refetch}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              title="更新"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* テーブル */}
      {projects.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-500">工事データがありません</p>
          <p className="text-gray-400 text-sm mt-1">新しい工事を登録してください</p>
        </div>
      ) : (
        <ResponsiveProjectTable
          projects={projects}
          sortParams={sortParams}
          onSort={handleSort}
          onProjectSelect={onProjectSelect}
          onProjectEdit={onProjectEdit}
          onProjectDelete={onProjectDelete}
        />
      )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader
                  field="name"
                  currentSort={sortParams}
                  onSort={handleSort}
                >
                  工事名称
                </SortableHeader>
                <SortableHeader
                  field="customer_name"
                  currentSort={sortParams}
                  onSort={handleSort}
                >
                  顧客名
                </SortableHeader>
                <SortableHeader
                  field="assignee"
                  currentSort={sortParams}
                  onSort={handleSort}
                >
                  担当者
                </SortableHeader>
                <SortableHeader
                  field="contract_amount"
                  currentSort={sortParams}
                  onSort={handleSort}
                >
                  契約金額
                </SortableHeader>
                <SortableHeader
                  field="status"
                  currentSort={sortParams}
                  onSort={handleSort}
                >
                  進捗ステータス
                </SortableHeader>
                <SortableHeader
                  field="planned_completion_date"
                  currentSort={sortParams}
                  onSort={handleSort}
                >
                  完工予定日
                </SortableHeader>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className={`${getRowColor(project.status)} cursor-pointer transition-colors`}
                  onClick={() => onProjectSelect?.(project)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {project.name}
                    </div>
                    {project.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {project.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.customer_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.assignee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {formatCurrency(project.contract_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const colors = getStatusColor(project.status)
                      return (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {project.status}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateShort(project.planned_completion_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onProjectEdit?.(project)
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
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
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                        title="削除"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && projects.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPage={true}
          itemsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
      </div>
    </>
  )
}

// ソート可能なヘッダーコンポーネント
interface SortableHeaderProps {
  field: keyof Project
  currentSort: SortParams
  onSort: (field: keyof Project) => void
  children: React.ReactNode
}

function SortableHeader({ field, currentSort, onSort, children }: SortableHeaderProps) {
  const isActive = currentSort.field === field
  const direction = currentSort.direction

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
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