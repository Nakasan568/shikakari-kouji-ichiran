import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockProject, mockEmployee } from '../../../test/utils'
import ProjectForm from '../ProjectForm'

// useEmployeesフックのモック
vi.mock('../../../hooks/useEmployees', () => ({
  useEmployees: vi.fn(() => ({
    employees: [mockEmployee],
    loading: false,
    error: null,
    refetch: vi.fn()
  }))
}))

describe('ProjectForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('新規登録フォーム', () => {
    it('正しくレンダリングされる', () => {
      render(
        <ProjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('新規工事登録')).toBeInTheDocument()
      expect(screen.getByText('新しい工事の情報を入力してください')).toBeInTheDocument()
      expect(screen.getByLabelText(/工事名称/)).toBeInTheDocument()
      expect(screen.getByLabelText(/顧客名/)).toBeInTheDocument()
      expect(screen.getByLabelText(/担当者/)).toBeInTheDocument()
      expect(screen.getByLabelText(/契約金額/)).toBeInTheDocument()
      expect(screen.getByLabelText(/実行予算/)).toBeInTheDocument()
      expect(screen.getByLabelText(/進捗ステータス/)).toBeInTheDocument()
    })

    it('必須項目のバリデーションが動作する', async () => {
      const user = userEvent.setup()
      
      render(
        <ProjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const submitButton = screen.getByRole('button', { name: '登録' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('工事名称は必須です')).toBeInTheDocument()
        expect(screen.getByText('担当者は必須です')).toBeInTheDocument()
        expect(screen.getByText('契約金額は必須です')).toBeInTheDocument()
        expect(screen.getByText('実行予算は必須です')).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('正しいデータでフォーム送信ができる', async () => {
      const user = userEvent.setup()
      mockOnSubmit.mockResolvedValue({ error: null })

      render(
        <ProjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      // フォームに入力
      await user.type(screen.getByLabelText(/工事名称/), 'テスト工事')
      await user.type(screen.getByLabelText(/顧客名/), 'テスト顧客')
      await user.selectOptions(screen.getByLabelText(/担当者/), mockEmployee.name)
      await user.type(screen.getByLabelText(/契約金額/), '10000000')
      await user.type(screen.getByLabelText(/実行予算/), '9000000')

      const submitButton = screen.getByRole('button', { name: '登録' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'テスト工事',
          customer_name: 'テスト顧客',
          assignee: mockEmployee.name,
          contract_amount: 10000000,
          execution_budget: 9000000,
          planned_start_date: '',
          planned_completion_date: '',
          status: '計画中',
          notes: ''
        })
      })
    })

    it('キャンセルボタンが動作する', async () => {
      const user = userEvent.setup()

      render(
        <ProjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('編集フォーム', () => {
    it('既存データで正しく初期化される', () => {
      render(
        <ProjectForm
          project={mockProject}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('工事情報の編集')).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockProject.name)).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockProject.customer_name!)).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockProject.assignee)).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockProject.contract_amount.toString())).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockProject.execution_budget.toString())).toBeInTheDocument()
    })

    it('更新ボタンが表示される', () => {
      render(
        <ProjectForm
          project={mockProject}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument()
    })
  })

  describe('バリデーション', () => {
    it('金額フィールドで数値以外を拒否する', async () => {
      const user = userEvent.setup()

      render(
        <ProjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const contractAmountInput = screen.getByLabelText(/契約金額/)
      await user.type(contractAmountInput, 'abc')

      // 数値以外の文字は入力されない（フォーマット関数により）
      expect(contractAmountInput).toHaveValue('0')
    })

    it('日付の関係性をチェックする', async () => {
      const user = userEvent.setup()

      render(
        <ProjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      // 必須項目を入力
      await user.type(screen.getByLabelText(/工事名称/), 'テスト工事')
      await user.selectOptions(screen.getByLabelText(/担当者/), mockEmployee.name)
      await user.type(screen.getByLabelText(/契約金額/), '10000000')
      await user.type(screen.getByLabelText(/実行予算/), '9000000')

      // 完工予定日を着工予定日より前に設定
      await user.type(screen.getByLabelText(/着工予定日/), '2024-06-01')
      await user.type(screen.getByLabelText(/完工予定日/), '2024-01-01')

      const submitButton = screen.getByRole('button', { name: '登録' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('完工予定日は着工予定日以降の日付を入力してください')).toBeInTheDocument()
      })
    })
  })

  describe('ローディング状態', () => {
    it('送信中はボタンが無効化される', async () => {
      const user = userEvent.setup()
      // 送信処理を遅延させる
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)))

      render(
        <ProjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      // 必須項目を入力
      await user.type(screen.getByLabelText(/工事名称/), 'テスト工事')
      await user.selectOptions(screen.getByLabelText(/担当者/), mockEmployee.name)
      await user.type(screen.getByLabelText(/契約金額/), '10000000')
      await user.type(screen.getByLabelText(/実行予算/), '9000000')

      const submitButton = screen.getByRole('button', { name: '登録' })
      await user.click(submitButton)

      // ローディング中はボタンが無効化される
      expect(screen.getByRole('button', { name: /登録中/ })).toBeDisabled()
    })

    it('loading propが true の時はフォームが無効化される', () => {
      render(
        <ProjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={true}
        />
      )

      expect(screen.getByLabelText(/工事名称/)).toBeDisabled()
      expect(screen.getByLabelText(/担当者/)).toBeDisabled()
      expect(screen.getByRole('button', { name: /登録中/ })).toBeDisabled()
    })
  })
})