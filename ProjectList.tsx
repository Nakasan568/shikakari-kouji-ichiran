import React, { useState } from 'react'
import { useProjects } from '../../hooks/useProjects'
import SearchFilters from './SearchFilters'
import Pagination from '../common/Pagination'
import ResponsiveProjectTable from './ResponsiveProjectTable'
import type { Project, SortParams, SearchFilters as SearchFiltersType } from '../../types'

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
    setCurrentPage(1)
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
    setCurrentPage(1)
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
      <SearchFilters
        onFiltersChange={handleFiltersChange}
        onClear={handleClearFilters}
        initialFilters={filters}
      />

      <div className="bg-white shadow rounded-lg">
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

        {/* テーブル部分は ResponsiveProjectTable に委譲 */}
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
            className={`h-3 w-3 ${isActive && direction === 'asc' ? 'text-blue-600' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg
            className={`h-3 w-3 -mt-1 ${isActive && direction === 'desc' ? 'text-blue-600' : 'text-gray-300'}`}
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
