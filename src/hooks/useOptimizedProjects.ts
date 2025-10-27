import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Project, SearchFilters, SortParams } from '../types'

interface UseOptimizedProjectsParams {
  filters?: SearchFilters
  sort?: SortParams
  page?: number
  limit?: number
}

// 最適化されたプロジェクト取得フック
export const useOptimizedProjects = ({
  filters = {},
  sort = { field: 'created_at', direction: 'desc' },
  page = 1,
  limit = 25
}: UseOptimizedProjectsParams = {}) => {
  
  // クエリキーをメモ化
  const queryKey = useMemo(() => [
    'projects',
    filters,
    sort,
    page,
    limit
  ], [filters, sort, page, limit])

  // クエリ関数をメモ化
  const queryFn = useMemo(() => async () => {
    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })

    // フィルター適用
    if (filters.projectName) {
      query = query.ilike('name', `%${filters.projectName}%`)
    }
    if (filters.assignee) {
      query = query.eq('assignee', filters.assignee)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.completionDateFrom) {
      query = query.gte('planned_completion_date', filters.completionDateFrom)
    }
    if (filters.completionDateTo) {
      query = query.lte('planned_completion_date', filters.completionDateTo)
    }

    // ソート適用
    query = query.order(sort.field, { ascending: sort.direction === 'asc' })

    // ページネーション適用
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data as Project[],
      count: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }, [filters, sort, page, limit])

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 2 * 60 * 1000, // 2分間キャッシュ
    gcTime: 5 * 60 * 1000, // 5分間メモリに保持
  })
}

// プロジェクト詳細取得の最適化フック
export const useOptimizedProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Project
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    gcTime: 10 * 60 * 1000, // 10分間メモリに保持
  })
}