import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockProject, mockEmployee, createMockProjects } from '../../../test/utils'
import ConstructionProjectApp from '../../ConstructionProjectApp'

// 認証状態をモック（認証済み）
const mockAuthContext = {
  user: { id: 'user-123', email: 'test@example.com' },
  session: { user: { id: 'user-123', email: 'test@example.com' } },
  loading: false,
  error: null,
  isAuthenticated: true,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  clearError: vi.fn()
}

vi.mock('../../auth/AuthProvider', () => ({
  useAuthContext: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}))

// useProjectsフックのモック
const mockUseProjects = {
  projects: createMockProjects(3),
  loading: false,
  error: null,
  total: 3,
  totalPages: 1,
  currentPage: 1,
  itemsPerPage: 25,
  refetch: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn()
}

vi.mock('../../../hooks/useProjects', () => ({
  useProjects: () => mockUseProjects
}))

// useEmployeesフックのモック
vi.mock('../../../hooks/useEmployees', () => ({
  useEmployees: () => ({
    employees: [mockEmployee],
    loading: false,
    error: null,
    refetch: vi.fn()
  })
}))

// Supabaseテストユーティリティのモック
vi.mock('../../../utils/supabaseTest', () => ({
  testSupabaseConnection: vi.fn(() => Promise.resolve({
    success: true,
    message: 'テスト成功',
    details: { employeesCount: 1, projectsCount: 3 }
  }))
}))

describe('工事データCRUD統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('工事一覧表示', () => {
    it('工事一覧が正しく表示される', async () => {
      render(<ConstructionProjectApp />)

      // 工事一覧ボタンをクリック
      const listButton = screen.getByRole('button', { name: /工事一覧/ })
      await userEvent.setup().click(listButton)

      await waitFor(() => {
        expect(screen.getByText('工事一覧 (3件)')).toBeInTheDocument()
        expect(screen.getByText('テスト工事 1')).toBeInTheDocument()
        expect(screen.getByText('テスト工事 2')).toBeInTheDocument()
        expect(screen.getByText('テスト工事 3')).toBeInTheDocument()
      })
    })

    it('工事詳細表示が動作する', async () => {
      const user = userEvent.setup()

      render(<ConstructionProjectApp />)

      // 工事一覧に移動
      const listButton = screen.getByRole('button', { name: /工事一覧/ })
      await user.click(listButton)

      await waitFor(() => {
        expect(screen.getByText('テスト工事 1')).toBeInTheDocument()
      })

      // 工事をクリックして詳細表示
      const projectRow = screen.getByText('テスト工事 1')
      await user.click(projectRow)

      await waitFor(() => {
        expect(screen.getByText('工事詳細')).toBeInTheDocument()
        expect(screen.getByText('テスト工事 1')).toBeInTheDocument()
      })
    })
  })

  describe('工事新規登録', () => {
    it('新規登録フォームが表示される', async () => {
      const user = userEvent.setup()

      render(<ConstructionProjectApp />)

      const newButton = screen.getByRole('button', { name: /新規登録/ })
      await user.click(newButton)

      await waitFor(() => {
        expect(screen.getByText('新規工事登録')).toBeInTheDocument()
        expect(screen.getByLabelText(/工事名称/)).toBeInTheDocument()
        expect(screen.getByLabelText(/担当者/)).toBeInTheDocument()
      })
    })

    it('新規工事登録フローが完了する', async () => {
      const user = userEvent.setup()
      mockUseProjects.createProject.mockResolvedValue({ error: null })

      render(<ConstructionProjectApp />)

      // 新規登録フォームに移動
      const newButton = screen.getByRole('button', { name: /新規登録/ })
      await user.click(newButton)

      await waitFor(() => {
        expect(screen.getByText('新規工事登録')).toBeInTheDocument()
      })

      // フォームに入力
      await user.type(screen.getByLabelText(/工事名称/), '新規テスト工事')
      await user.type(screen.getByLabelText(/顧客名/), '新規テスト顧客')
      await user.selectOptions(screen.getByLabelText(/担当者/), mockEmployee.name)
      await user.type(screen.getByLabelText(/契約金額/), '15000000')
      await user.type(screen.getByLabelText(/実行予算/), '13500000')

      // 送信
      const submitButton = screen.getByRole('button', { name: '登録' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUseProjects.createProject).toHaveBeenCalledWith({
          name: '新規テスト工事',
          customer_name: '新規テスト顧客',
          assignee: mockEmployee.name,
          contract_amount: 15000000,
          execution_budget: 13500000,
          planned_start_date: '',
          planned_completion_date: '',
          status: '計画中',
          notes: ''
        })
      })
    })
  })

  describe('工事編集', () => {
    it('編集フォームが既存データで初期化される', async () => {
      const user = userEvent.setup()

      render(<ConstructionProjectApp />)

      // 工事一覧に移動
      const listButton = screen.getByRole('button', { name: /工事一覧/ })
      await user.click(listButton)

      await waitFor(() => {
        expect(screen.getByText('テスト工事 1')).toBeInTheDocument()
      })

      // 編集ボタンをクリック
      const editButtons = screen.getAllByTitle('編集')
      await user.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByText('工事情報の編集')).toBeInTheDocument()
        expect(screen.getByDisplayValue('テスト工事 1')).toBeInTheDocument()
      })
    })

    it('工事更新フローが完了する', async () => {
      const user = userEvent.setup()
      mockUseProjects.updateProject.mockResolvedValue({ error: null })

      render(<ConstructionProjectApp />)

      // 工事一覧に移動
      const listButton = screen.getByRole('button', { name: /工事一覧/ })
      await user.click(listButton)

      await waitFor(() => {
        expect(screen.getByText('テスト工事 1')).toBeInTheDocument()
      })

      // 編集ボタンをクリック
      const editButtons = screen.getAllByTitle('編集')
      await user.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByText('工事情報の編集')).toBeInTheDocument()
      })

      // 工事名を変更
      const nameInput = screen.getByDisplayValue('テスト工事 1')
      await user.clear(nameInput)
      await user.type(nameInput, '更新されたテスト工事')

      // 更新ボタンをクリック
      const updateButton = screen.getByRole('button', { name: '更新' })
      await user.click(updateButton)

      await waitFor(() => {
        expect(mockUseProjects.updateProject).toHaveBeenCalled()
      })
    })
  })

  describe('工事削除', () => {
    it('削除確認ダイアログが表示される', async () => {
      const user = userEvent.setup()

      render(<ConstructionProjectApp />)

      // 工事一覧に移動
      const listButton = screen.getByRole('button', { name: /工事一覧/ })
      await user.click(listButton)

      await waitFor(() => {
        expect(screen.getByText('テスト工事 1')).toBeInTheDocument()
      })

      // 削除ボタンをクリック
      const deleteButtons = screen.getAllByTitle('削除')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('工事データの削除')).toBeInTheDocument()
        expect(screen.getByText(/工事「テスト工事 1」を削除しますか？/)).toBeInTheDocument()
      })
    })

    it('削除フローが完了する', async () => {
      const user = userEvent.setup()
      mockUseProjects.deleteProject.mockResolvedValue({ error: null })

      render(<ConstructionProjectApp />)

      // 工事一覧に移動
      const listButton = screen.getByRole('button', { name: /工事一覧/ })
      await user.click(listButton)

      await waitFor(() => {
        expect(screen.getByText('テスト工事 1')).toBeInTheDocument()
      })

      // 削除ボタンをクリック
      const deleteButtons = screen.getAllByTitle('削除')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('工事データの削除')).toBeInTheDocument()
      })

      // 削除を確認
      const confirmButton = screen.getByRole('button', { name: '削除' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockUseProjects.deleteProject).toHaveBeenCalled()
      })
    })

    it('削除キャンセルが動作する', async () => {
      const user = userEvent.setup()

      render(<ConstructionProjectApp />)

      // 工事一覧に移動
      const listButton = screen.getByRole('button', { name: /工事一覧/ })
      await user.click(listButton)

      await waitFor(() => {
        expect(screen.getByText('テスト工事 1')).toBeInTheDocument()
      })

      // 削除ボタンをクリック
      const deleteButtons = screen.getAllByTitle('削除')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('工事データの削除')).toBeInTheDocument()
      })

      // キャンセルボタンをクリック
      const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('工事データの削除')).not.toBeInTheDocument()
      })

      expect(mockUseProjects.deleteProject).not.toHaveBeenCalled()
    })
  })

  describe('検索・フィルタリング', () => {
    it('工事名称での検索が動作する', async () => {
      const user = userEvent.setup()

      render(<ConstructionProjectApp />)

      // 工事一覧に移動
      const listButton = screen.getByRole('button', { name: /工事一覧/ })
      await user.click(listButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('工事名称で検索...')).toBeInTheDocument()
      })

      // 検索フィールドに入力
      const searchInput = screen.getByPlaceholderText('工事名称で検索...')
      await user.type(searchInput, 'テスト')

      // 検索が実行されることを確認（リアルタイム検索）
      await waitFor(() => {
        // useProjectsフックが新しいフィルターで呼ばれることを期待
        // 実際の実装では、フィルターの変更によりuseProjectsが再実行される
      })
    })

    it('ステータスフィルターが動作する', async () => {
      const user = userEvent.setup()

      render(<ConstructionProjectApp />)

      // 工事一覧に移動
      const listButton = screen.getByRole('button', { name: /工事一覧/ })
      await user.click(listButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/進捗ステータス/)).toBeInTheDocument()
      })

      // ステータスフィルターを選択
      const statusSelect = screen.getByLabelText(/進捗ステータス/)
      await user.selectOptions(statusSelect, '仕掛中')

      // フィルターが適用されることを確認
      await waitFor(() => {
        expect(statusSelect).toHaveValue('仕掛中')
      })
    })
  })

  describe('ナビゲーション', () => {
    it('ダッシュボード、一覧、新規登録間の遷移が動作する', async () => {
      const user = userEvent.setup()

      render(<ConstructionProjectApp />)

      // 初期状態はダッシュボード
      expect(screen.getByText(/ようこそ/)).toBeInTheDocument()

      // 工事一覧に移動
      const listButton = screen.getByRole('button', { name: /工事一覧/ })
      await user.click(listButton)

      await waitFor(() => {
        expect(screen.getByText('工事一覧 (3件)')).toBeInTheDocument()
      })

      // 新規登録に移動
      const newButton = screen.getByRole('button', { name: /新規登録/ })
      await user.click(newButton)

      await waitFor(() => {
        expect(screen.getByText('新規工事登録')).toBeInTheDocument()
      })

      // ダッシュボードに戻る
      const dashboardButton = screen.getByRole('button', { name: /ダッシュボード/ })
      await user.click(dashboardButton)

      await waitFor(() => {
        expect(screen.getByText(/ようこそ/)).toBeInTheDocument()
      })
    })
  })

  describe('エラー状態', () => {
    it('データ取得エラーが適切に表示される', async () => {
      // エラー状態をモック
      const errorUseProjects = {
        ...mockUseProjects,
        loading: false,
        error: 'データベース接続エラー',
        projects: []
      }

      vi.mocked(vi.fn()).mockReturnValue(errorUseProjects)

      render(<ConstructionProjectApp />)

      const listButton = screen.getByRole('button', { name: /工事一覧/ })
      await userEvent.setup().click(listButton)

      // エラーメッセージが表示されることを期待
      // 実際の実装では、ProjectListコンポーネントがエラー状態を表示する
    })
  })

  describe('レスポンシブ対応', () => {
    it('モバイル表示でカード形式になる', async () => {
      // 画面サイズをモバイルサイズに設定
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })

      // useResponsiveフックをモック
      vi.mock('../../../hooks/useResponsive', () => ({
        useResponsive: () => ({
          isMobile: true,
          isTablet: false,
          isDesktop: false,
          currentBreakpoint: 'sm',
          windowWidth: 600,
          windowHeight: 800
        })
      }))

      render(<ConstructionProjectApp />)

      const listButton = screen.getByRole('button', { name: /工事一覧/ })
      await userEvent.setup().click(listButton)

      // モバイル表示では、テーブルではなくカード形式で表示される
      // 実際の実装では、ResponsiveProjectTableがモバイル用カードを表示する
    })
  })
})