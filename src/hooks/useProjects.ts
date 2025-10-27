import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'
import { parseError, logError, withErrorHandling } from '../utils/errorHandler'
import type { Project, SearchFilters, SortParams } from '../types'

interface UseProjectsOptions {
  filters?: SearchFilters
  sort?: SortParams
  page?: number
  limit?: number
}

interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  total: number
  totalPages: number
  currentPage: number
  itemsPerPage: number
  refetch: () => Promise<void>
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>
  updateProject: (id: string, updates: Partial<Project>) => Promise<{ error: string | null }>
  deleteProject: (id: string) => Promise<{ error: string | null }>
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const { showSuccess, showError } = useToast()

  const { filters, sort, page = 1, limit = 25 } = options
  const offset = (page - 1) * limit

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('projects')
        .select('*', { count: 'exact' })

      // フィルター適用
      if (filters) {
        if (filters.projectId) {
          query = query.ilike('id', `%${filters.projectId}%`)
        }
        if (filters.projectName) {
          query = query.ilike('name', `%${filters.projectName}%`)
        }
        if (filters.assignee) {
          query = query.ilike('assignee', `%${filters.assignee}%`)
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
      }

      // ソート適用
      if (sort) {
        query = query.order(sort.field as string, { ascending: sort.direction === 'asc' })
      } else {
        // デフォルトソート: 作成日時の降順
        query = query.order('created_at', { ascending: false })
      }

      // ページネーション
      query = query.range(offset, offset + limit - 1)

      const { data, error: fetchError, count } = await query

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setProjects(data || [])
      setTotal(count || 0)
      console.log(`✅ 工事データ取得成功: ${data?.length || 0}件 / 全${count || 0}件 (ページ${page})`)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '工事データの取得に失敗しました'
      setError(errorMessage)
      console.error('❌ 工事データ取得エラー:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters, sort, page, limit])

  // 工事データの作成
  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await withErrorHandling(async () => {
      const { error: insertError } = await supabase
        .from('projects')
        .insert([projectData])

      if (insertError) {
        throw new Error(insertError.message)
      }

      return true
    }, '工事データ作成')

    if (error) {
      showError('工事登録エラー', error.userMessage)
      return { error: error.userMessage }
    }

    showSuccess('工事登録完了', `工事「${projectData.name}」を登録しました`)
    await fetchProjects() // データを再取得
    return { error: null }
  }, [fetchProjects, showSuccess, showError])

  // 工事データの更新
  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const { data, error } = await withErrorHandling(async () => {
      const { error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      return true
    }, '工事データ更新')

    if (error) {
      showError('工事更新エラー', error.userMessage)
      return { error: error.userMessage }
    }

    showSuccess('工事更新完了', `工事情報を更新しました`)
    await fetchProjects() // データを再取得
    return { error: null }
  }, [fetchProjects, showSuccess, showError])

  // 工事データの削除
  const deleteProject = useCallback(async (id: string) => {
    const { data, error } = await withErrorHandling(async () => {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      return true
    }, '工事データ削除')

    if (error) {
      showError('工事削除エラー', error.userMessage)
      return { error: error.userMessage }
    }

    showSuccess('工事削除完了', '工事データを削除しました')
    await fetchProjects() // データを再取得
    return { error: null }
  }, [fetchProjects, showSuccess, showError])

  // 初回データ取得
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const totalPages = Math.ceil(total / limit)

  return {
    projects,
    loading,
    error,
    total,
    totalPages,
    currentPage: page,
    itemsPerPage: limit,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}