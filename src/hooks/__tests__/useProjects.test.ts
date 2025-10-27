import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProjects } from '../useProjects'
import { mockProject, createMockProjects } from '../../test/utils'

// Supabaseクライアントのモック
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() => Promise.resolve({ 
            data: createMockProjects(3), 
            error: null, 
            count: 3 
          }))
        })),
        ilike: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({ 
              data: [mockProject], 
              error: null, 
              count: 1 
            }))
          }))
        }))
      }))
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }))
}

// ToastContextのモック
const mockToast = {
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showWarning: vi.fn(),
  showInfo: vi.fn()
}

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}))

vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => mockToast
}))

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('データ取得', () => {
    it('初期状態でプロジェクトデータを取得する', async () => {
      const { result } = renderHook(() => useProjects())

      // 初期状態はローディング中
      expect(result.current.loading).toBe(true)
      expect(result.current.projects).toEqual([])

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.projects).toHaveLength(3)
      expect(result.current.total).toBe(3)
      expect(result.current.error).toBeNull()
    })

    it('フィルターオプションが正しく適用される', async () => {
      const filters = {
        projectName: 'テスト',
        status: '仕掛中' as const
      }

      renderHook(() => useProjects({ filters }))

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      })

      // フィルターが適用されることを確認
      const selectChain = mockSupabase.from().select()
      expect(selectChain.ilike).toHaveBeenCalledWith('name', '%テスト%')
      expect(selectChain.eq).toHaveBeenCalledWith('status', '仕掛中')
    })

    it('ソートオプションが正しく適用される', async () => {
      const sort = {
        field: 'name' as const,
        direction: 'asc' as const
      }

      renderHook(() => useProjects({ sort }))

      await waitFor(() => {
        const orderChain = mockSupabase.from().select().order
        expect(orderChain).toHaveBeenCalledWith('name', { ascending: true })
      })
    })

    it('ページネーションが正しく適用される', async () => {
      const options = {
        page: 2,
        limit: 10
      }

      renderHook(() => useProjects(options))

      await waitFor(() => {
        const rangeChain = mockSupabase.from().select().order().range
        expect(rangeChain).toHaveBeenCalledWith(10, 19) // (page-1)*limit, page*limit-1
      })
    })
  })

  describe('CRUD操作', () => {
    it('createProject が正しく動作する', async () => {
      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newProjectData = {
        name: '新規工事',
        customer_name: '新規顧客',
        assignee: '担当者',
        contract_amount: 5000000,
        execution_budget: 4500000,
        planned_start_date: '2024-01-01',
        planned_completion_date: '2024-06-30',
        status: '計画中' as const,
        notes: '新規工事の特記事項'
      }

      const createResult = await result.current.createProject(newProjectData)

      expect(createResult.error).toBeNull()
      expect(mockSupabase.from().insert).toHaveBeenCalledWith([newProjectData])
      expect(mockToast.showSuccess).toHaveBeenCalledWith(
        '工事登録完了',
        '工事「新規工事」を登録しました'
      )
    })

    it('updateProject が正しく動作する', async () => {
      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const updates = {
        name: '更新された工事名',
        status: '完工済' as const
      }

      const updateResult = await result.current.updateProject('test-id', updates)

      expect(updateResult.error).toBeNull()
      expect(mockSupabase.from().update).toHaveBeenCalledWith(updates)
      expect(mockToast.showSuccess).toHaveBeenCalledWith(
        '工事更新完了',
        '工事情報を更新しました'
      )
    })

    it('deleteProject が正しく動作する', async () => {
      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const deleteResult = await result.current.deleteProject('test-id')

      expect(deleteResult.error).toBeNull()
      expect(mockSupabase.from().delete().eq).toHaveBeenCalledWith('id', 'test-id')
      expect(mockToast.showSuccess).toHaveBeenCalledWith(
        '工事削除完了',
        '工事データを削除しました'
      )
    })
  })

  describe('エラーハンドリング', () => {
    it('データ取得エラーを正しく処理する', async () => {
      const errorMessage = 'データベース接続エラー'
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({ 
              data: null, 
              error: { message: errorMessage }, 
              count: 0 
            }))
          }))
        }))
      })

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.projects).toEqual([])
    })

    it('作成エラーを正しく処理する', async () => {
      const errorMessage = '作成に失敗しました'
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => Promise.resolve({ 
          data: null, 
          error: { message: errorMessage } 
        }))
      })

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newProjectData = {
        name: '新規工事',
        assignee: '担当者',
        contract_amount: 5000000,
        execution_budget: 4500000,
        status: '計画中' as const
      }

      const createResult = await result.current.createProject(newProjectData)

      expect(createResult.error).toBe(errorMessage)
      expect(mockToast.showError).toHaveBeenCalledWith(
        '工事登録エラー',
        errorMessage
      )
    })
  })

  describe('ページネーション計算', () => {
    it('totalPages が正しく計算される', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({ 
              data: createMockProjects(10), 
              error: null, 
              count: 25 
            }))
          }))
        }))
      })

      const { result } = renderHook(() => useProjects({ limit: 10 }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.totalPages).toBe(3) // Math.ceil(25 / 10)
      expect(result.current.currentPage).toBe(1)
      expect(result.current.itemsPerPage).toBe(10)
    })
  })
})