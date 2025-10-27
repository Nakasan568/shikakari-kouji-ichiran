import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils'
import userEvent from '@testing-library/user-event'
import { ProjectList } from '../../components/projects/ProjectList'
import { ProjectForm } from '../../components/projects/ProjectForm'
import { supabase } from '../../lib/supabase'
import { mockProject, mockEmployee, createMockProjects, createMockEmployees } from '../utils'

// Supabaseモックの設定
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
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
}))

// React Queryのモック
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn()
  }))
}))

describe('工事データCRUD統合テスト', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('工事一覧表示機能', () => {
    it('工事データが正常に表示される', async () => {
      const mockProjects = createMockProjects(3)
      
      // useQueryのモック設定
      const { useQuery } = await import('@tanstack/react-query')
      vi.mocked(useQuery).mockImplementation((options: any) => {
        if (options.queryKey[0] === 'projects') {
          return {
            data: { data: mockProjects, count: 3 },
            error: null,
            isLoading: false,
            refetch: vi.fn()
          }
        }
        if (options.queryKey[0] === 'employees') {
          return {
            data: createMockEmployees(2),
            error: null,
            isLoading: false,
            refetch: vi.fn()
          }
        }
        return {
          data: null,
          error: null,
          isLoading: false,
          refetch: vi.fn()
        }
      })

      render(<ProjectList />)

      // 工事データが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('テスト工事 1')).toBeInTheDocument()
        expect(screen.getByText('テスト工事 2')).toBeInTheDocument()
        expect(screen.getByText('テスト工事 3')).toBeInTheDocument()
      })
    })

    it('ローディング状態が正常に表示される', async () => {
      // useQueryのモック設定（ローディング状態）
      const { useQuery } = await import('@tanstack/react-query')
      vi.mocked(useQuery).mockReturnValue({
        data: null,
        error: null,
        isLoading: true,
        refetch: vi.fn()
      })

      render(<ProjectList />)

      // ローディングスピナーが表示されることを確認
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('エラー状態が正常に表示される', async () => {
      // useQueryのモック設定（エラー状態）
      const { useQuery } = await import('@tanstack/react-query')
      vi.mocked(useQuery).mockReturnValue({
        data: null,
        error: new Error('データの取得に失敗しました'),
        isLoading: false,
        refetch: vi.fn()
      })

      render(<ProjectList />)

      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/データの取得に失敗しました/i)).toBeInTheDocument()
      })
    })
  })

  describe('工事データ新規登録機能', () => {
    it('有効なデータで新規登録が成功する', async () => {
      const mockMutate = vi.fn()
      
      // useMutationのモック設定
      const { useMutation } = await import('@tanstack/react-query')
      vi.mocked(useMutation).mockReturnValue({
        mutate: mockMutate,
        isLoading: false,
        error: null,
        data: null,
        isError: false,
        isSuccess: false,
        reset: vi.fn()
      } as any)

      // useQueryのモック設定（社員データ）
      const { useQuery } = await import('@tanstack/react-query')
      vi.mocked(useQuery).mockReturnValue({
        data: createMockEmployees(2),
        error: null,
        isLoading: false,
        refetch: vi.fn()
      })

      render(<ProjectForm />)

      // フォーム入力
      await user.type(screen.getByLabelText(/工事名称/i), '新規テスト工事')
      await user.type(screen.getByLabelText(/顧客名/i), '新規テスト顧客')
      await user.selectOptions(screen.getByLabelText(/担当者/i), 'テスト社員 1')
      await user.type(screen.getByLabelText(/契約金額/i), '15000000')
      await user.type(screen.getByLabelText(/実行予算/i), '14000000')
      await user.type(screen.getByLabelText(/着工予定日/i), '2024-02-01')
      await user.type(screen.getByLabelText(/完工予定日/i), '2024-08-31')
      await user.selectOptions(screen.getByLabelText(/進捗ステータス/i), '計画中')

      // 保存ボタンをクリック
      const saveButton = screen.getByRole('button', { name: /保存/i })
      await user.click(saveButton)

      // mutateが正しいデータで呼ばれることを確認
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          name: '新規テスト工事',
          customer_name: '新規テスト顧客',
          assignee: 'テスト社員 1',
          contract_amount: 15000000,
          execution_budget: 14000000,
          planned_start_date: '2024-02-01',
          planned_completion_date: '2024-08-31',
          status: '計画中',
          notes: ''
        })
      })
    })

    it('必須項目が未入力の場合バリデーションエラーが表示される', async () => {
      // useQueryのモック設定
      const { useQuery } = await import('@tanstack/react-query')
      vi.mocked(useQuery).mockReturnValue({
        data: createMockEmployees(2),
        error: null,
        isLoading: false,
        refetch: vi.fn()
      })

      // useMutationのモック設定
      const { useMutation } = await import('@tanstack/react-query')
      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        isLoading: false,
        error: null,
        data: null,
        isError: false,
        isSuccess: false,
        reset: vi.fn()
      } as any)

      render(<ProjectForm />)

      // 保存ボタンをクリック（必須項目未入力）
      const saveButton = screen.getByRole('button', { name: /保存/i })
      await user.click(saveButton)

      // バリデーションエラーが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/工事名称は必須です/i)).toBeInTheDocument()
        expect(screen.getByText(/担当者は必須です/i)).toBeInTheDocument()
        expect(screen.getByText(/契約金額は必須です/i)).toBeInTheDocument()
        expect(screen.getByText(/実行予算は必須です/i)).toBeInTheDocument()
      })
    })

    it('数値項目に無効な値を入力した場合バリデーションエラーが表示される', async () => {
      // useQueryのモック設定
      const { useQuery } = await import('@tanstack/react-query')
      vi.mocked(useQuery).mockReturnValue({
        data: createMockEmployees(2),
        error: null,
        isLoading: false,
        refetch: vi.fn()
      })

      // useMutationのモック設定
      const { useMutation } = await import('@tanstack/react-query')
      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        isLoading: false,
        error: null,
        data: null,
        isError: false,
        isSuccess: false,
        reset: vi.fn()
      } as any)

      render(<ProjectForm />)

      // 無効な数値を入力
      await user.type(screen.getByLabelText(/工事名称/i), 'テスト工事')
      await user.selectOptions(screen.getByLabelText(/担当者/i), 'テスト社員 1')
      await user.type(screen.getByLabelText(/契約金額/i), '-1000')
      await user.type(screen.getByLabelText(/実行予算/i), 'abc')

      // 保存ボタンをクリック
      const saveButton = screen.getByRole('button', { name: /保存/i })
      await user.click(saveButton)

      // バリデーションエラーが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/契約金額は正の整数で入力してください/i)).toBeInTheDocument()
        expect(screen.getByText(/実行予算は正の整数で入力してください/i)).toBeInTheDocument()
      })
    })
  })

  describe('工事データ編集機能', () => {
    it('既存データの編集が正常に動作する', async () => {
      const mockMutate = vi.fn()
      
      // useMutationのモック設定
      const { useMutation } = await import('@tanstack/react-query')
      vi.mocked(useMutation).mockReturnValue({
        mutate: mockMutate,
        isLoading: false,
        error: null,
        data: null,
        isError: false,
        isSuccess: false,
        reset: vi.fn()
      } as any)

      // useQueryのモック設定
      const { useQuery } = await import('@tanstack/react-query')
      vi.mocked(useQuery).mockReturnValue({
        data: createMockEmployees(2),
        error: null,
        isLoading: false,
        refetch: vi.fn()
      })

      render(<ProjectForm project={mockProject} />)

      // 既存データが表示されることを確認
      expect(screen.getByDisplayValue('テスト工事')).toBeInTheDocument()
      expect(screen.getByDisplayValue('テスト顧客')).toBeInTheDocument()

      // データを編集
      const nameInput = screen.getByLabelText(/工事名称/i)
      await user.clear(nameInput)
      await user.type(nameInput, '編集されたテスト工事')

      // 保存ボタンをクリック
      const saveButton = screen.getByRole('button', { name: /保存/i })
      await user.click(saveButton)

      // 編集されたデータでmutateが呼ばれることを確認
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '編集されたテスト工事'
          })
        )
      })
    })
  })

  describe('工事データ削除機能', () => {
    it('削除確認ダイアログが表示され、削除が実行される', async () => {
      const mockProjects = createMockProjects(1)
      const mockDeleteMutate = vi.fn()
      
      // useQueryのモック設定
      const { useQuery } = await import('@tanstack/react-query')
      vi.mocked(useQuery).mockImplementation((options: any) => {
        if (options.queryKey[0] === 'projects') {
          return {
            data: { data: mockProjects, count: 1 },
            error: null,
            isLoading: false,
            refetch: vi.fn()
          }
        }
        if (options.queryKey[0] === 'employees') {
          return {
            data: createMockEmployees(2),
            error: null,
            isLoading: false,
            refetch: vi.fn()
          }
        }
        return {
          data: null,
          error: null,
          isLoading: false,
          refetch: vi.fn()
        }
      })

      // useMutationのモック設定
      const { useMutation } = await import('@tanstack/react-query')
      vi.mocked(useMutation).mockImplementation((options: any) => {
        if (options.mutationFn.toString().includes('delete')) {
          return {
            mutate: mockDeleteMutate,
            isLoading: false,
            error: null,
            data: null,
            isError: false,
            isSuccess: false,
            reset: vi.fn()
          } as any
        }
        return {
          mutate: vi.fn(),
          isLoading: false,
          error: null,
          data: null,
          isError: false,
          isSuccess: false,
          reset: vi.fn()
        } as any
      })

      render(<ProjectList />)

      // 削除ボタンをクリック
      const deleteButton = screen.getByRole('button', { name: /削除/i })
      await user.click(deleteButton)

      // 確認ダイアログが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/削除の確認/i)).toBeInTheDocument()
        expect(screen.getByText(/この工事データを削除しますか/i)).toBeInTheDocument()
      })

      // 削除を確認
      const confirmButton = screen.getByRole('button', { name: /削除する/i })
      await user.click(confirmButton)

      // 削除が実行されることを確認
      await waitFor(() => {
        expect(mockDeleteMutate).toHaveBeenCalledWith(mockProjects[0].id)
      })
    })

    it('削除確認ダイアログでキャンセルした場合削除されない', async () => {
      const mockProjects = createMockProjects(1)
      const mockDeleteMutate = vi.fn()
      
      // useQueryのモック設定
      const { useQuery } = await import('@tanstack/react-query')
      vi.mocked(useQuery).mockImplementation((options: any) => {
        if (options.queryKey[0] === 'projects') {
          return {
            data: { data: mockProjects, count: 1 },
            error: null,
            isLoading: false,
            refetch: vi.fn()
          }
        }
        if (options.queryKey[0] === 'employees') {
          return {
            data: createMockEmployees(2),
            error: null,
            isLoading: false,
            refetch: vi.fn()
          }
        }
        return {
          data: null,
          error: null,
          isLoading: false,
          refetch: vi.fn()
        }
      })

      // useMutationのモック設定
      const { useMutation } = await import('@tanstack/react-query')
      vi.mocked(useMutation).mockImplementation((options: any) => {
        if (options.mutationFn.toString().includes('delete')) {
          return {
            mutate: mockDeleteMutate,
            isLoading: false,
            error: null,
            data: null,
            isError: false,
            isSuccess: false,
            reset: vi.fn()
          } as any
        }
        return {
          mutate: vi.fn(),
          isLoading: false,
          error: null,
          data: null,
          isError: false,
          isSuccess: false,
          reset: vi.fn()
        } as any
      })

      render(<ProjectList />)

      // 削除ボタンをクリック
      const deleteButton = screen.getByRole('button', { name: /削除/i })
      await user.click(deleteButton)

      // キャンセルボタンをクリック
      const cancelButton = screen.getByRole('button', { name: /キャンセル/i })
      await user.click(cancelButton)

      // 削除が実行されないことを確認
      expect(mockDeleteMutate).not.toHaveBeenCalled()
    })
  })

  describe('検索・フィルタリング機能', () => {
    it('工事名称での検索が正常に動作する', async () => {
      const mockProjects = createMockProjects(3)
      
      // useQueryのモック設定
      const { useQuery } = await import('@tanstack/react-query')
      vi.mocked(useQuery).mockImplementation((options: any) => {
        if (options.queryKey[0] === 'projects') {
          const searchTerm = options.queryKey[1]?.projectName
          const filteredProjects = searchTerm 
            ? mockProjects.filter(p => p.name.includes(searchTerm))
            : mockProjects
          
          return {
            data: { data: filteredProjects, count: filteredProjects.length },
            error: null,
            isLoading: false,
            refetch: vi.fn()
          }
        }
        if (options.queryKey[0] === 'employees') {
          return {
            data: createMockEmployees(2),
            error: null,
            isLoading: false,
            refetch: vi.fn()
          }
        }
        return {
          data: null,
          error: null,
          isLoading: false,
          refetch: vi.fn()
        }
      })

      render(<ProjectList />)

      // 検索フィールドに入力
      const searchInput = screen.getByPlaceholderText(/工事名称で検索/i)
      await user.type(searchInput, 'テスト工事 1')

      // 検索結果が反映されることを確認
      await waitFor(() => {
        expect(screen.getByText('テスト工事 1')).toBeInTheDocument()
        expect(screen.queryByText('テスト工事 2')).not.toBeInTheDocument()
        expect(screen.queryByText('テスト工事 3')).not.toBeInTheDocument()
      })
    })

    it('進捗ステータスでのフィルタリングが正常に動作する', async () => {
      const mockProjects = createMockProjects(3)
      
      // useQueryのモック設定
      const { useQuery } = await import('@tanstack/react-query')
      vi.mocked(useQuery).mockImplementation((options: any) => {
        if (options.queryKey[0] === 'projects') {
          const statusFilter = options.queryKey[1]?.status
          const filteredProjects = statusFilter 
            ? mockProjects.filter(p => p.status === statusFilter)
            : mockProjects
          
          return {
            data: { data: filteredProjects, count: filteredProjects.length },
            error: null,
            isLoading: false,
            refetch: vi.fn()
          }
        }
        if (options.queryKey[0] === 'employees') {
          return {
            data: createMockEmployees(2),
            error: null,
            isLoading: false,
            refetch: vi.fn()
          }
        }
        return {
          data: null,
          error: null,
          isLoading: false,
          refetch: vi.fn()
        }
      })

      render(<ProjectList />)

      // ステータスフィルターを選択
      const statusSelect = screen.getByLabelText(/進捗ステータス/i)
      await user.selectOptions(statusSelect, '計画中')

      // フィルタリング結果が反映されることを確認
      await waitFor(() => {
        // 計画中のプロジェクトのみ表示される
        const planningProjects = mockProjects.filter(p => p.status === '計画中')
        planningProjects.forEach(project => {
          expect(screen.getByText(project.name)).toBeInTheDocument()
        })
      })
    })
  })
})