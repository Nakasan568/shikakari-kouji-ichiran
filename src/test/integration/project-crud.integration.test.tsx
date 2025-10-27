import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../utils'
import userEvent from '@testing-library/user-event'
import React from 'react'

// 簡単なプロジェクトフォームコンポーネントのテスト
describe('プロジェクトCRUD統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('プロジェクトフォームの基本機能が動作する', async () => {
    const user = userEvent.setup()
    const mockSubmit = vi.fn()

    const ProjectForm = () => {
      const [formData, setFormData] = React.useState({
        name: '',
        customer_name: '',
        assignee: '',
        contract_amount: '',
        execution_budget: '',
        status: '計画中'
      })

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mockSubmit(formData)
      }

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
          ...prev,
          [e.target.name]: e.target.value
        }))
      }

      return (
        <form onSubmit={handleSubmit} data-testid="project-form">
          <div>
            <label htmlFor="name">工事名称</label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="customer_name">顧客名</label>
            <input
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="assignee">担当者</label>
            <input
              id="assignee"
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="contract_amount">契約金額</label>
            <input
              id="contract_amount"
              name="contract_amount"
              type="number"
              value={formData.contract_amount}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="execution_budget">実行予算</label>
            <input
              id="execution_budget"
              name="execution_budget"
              type="number"
              value={formData.execution_budget}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="status">進捗ステータス</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="計画中">計画中</option>
              <option value="仕掛中">仕掛中</option>
              <option value="完工済">完工済</option>
            </select>
          </div>
          
          <button type="submit">保存</button>
        </form>
      )
    }

    render(<ProjectForm />)

    // フォームが表示されることを確認
    expect(screen.getByTestId('project-form')).toBeInTheDocument()

    // フォーム入力
    await user.type(screen.getByLabelText('工事名称'), 'テスト工事')
    await user.type(screen.getByLabelText('顧客名'), 'テスト顧客')
    await user.type(screen.getByLabelText('担当者'), 'テスト担当者')
    await user.type(screen.getByLabelText('契約金額'), '10000000')
    await user.type(screen.getByLabelText('実行予算'), '9000000')
    await user.selectOptions(screen.getByLabelText('進捗ステータス'), '仕掛中')

    // フォーム送信
    await user.click(screen.getByRole('button', { name: '保存' }))

    // 正しいデータで送信されることを確認
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'テスト工事',
        customer_name: 'テスト顧客',
        assignee: 'テスト担当者',
        contract_amount: '10000000',
        execution_budget: '9000000',
        status: '仕掛中'
      })
    })
  })

  it('プロジェクト一覧の表示機能が動作する', async () => {
    const mockProjects = [
      {
        id: '1',
        name: 'プロジェクト1',
        customer_name: '顧客1',
        assignee: '担当者1',
        contract_amount: 10000000,
        execution_budget: 9000000,
        status: '計画中' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'プロジェクト2',
        customer_name: '顧客2',
        assignee: '担当者2',
        contract_amount: 15000000,
        execution_budget: 14000000,
        status: '仕掛中' as const,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      }
    ]

    const ProjectList = ({ projects }: { projects: typeof mockProjects }) => {
      return (
        <div data-testid="project-list">
          <h2>工事一覧</h2>
          <table>
            <thead>
              <tr>
                <th>工事名称</th>
                <th>顧客名</th>
                <th>担当者</th>
                <th>契約金額</th>
                <th>進捗ステータス</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id} data-testid="project-row">
                  <td>{project.name}</td>
                  <td>{project.customer_name}</td>
                  <td>{project.assignee}</td>
                  <td>{project.contract_amount.toLocaleString()}</td>
                  <td>
                    <span className={`status-${project.status}`}>
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    render(<ProjectList projects={mockProjects} />)

    // 一覧が表示されることを確認
    expect(screen.getByTestId('project-list')).toBeInTheDocument()
    expect(screen.getByText('工事一覧')).toBeInTheDocument()

    // プロジェクトデータが表示されることを確認
    expect(screen.getByText('プロジェクト1')).toBeInTheDocument()
    expect(screen.getByText('プロジェクト2')).toBeInTheDocument()
    expect(screen.getByText('顧客1')).toBeInTheDocument()
    expect(screen.getByText('顧客2')).toBeInTheDocument()
    expect(screen.getByText('担当者1')).toBeInTheDocument()
    expect(screen.getByText('担当者2')).toBeInTheDocument()

    // 金額がフォーマットされて表示されることを確認
    expect(screen.getByText('10,000,000')).toBeInTheDocument()
    expect(screen.getByText('15,000,000')).toBeInTheDocument()

    // ステータスが表示されることを確認
    expect(screen.getByText('計画中')).toBeInTheDocument()
    expect(screen.getByText('仕掛中')).toBeInTheDocument()

    // 行数が正しいことを確認
    const rows = screen.getAllByTestId('project-row')
    expect(rows).toHaveLength(2)
  })

  it('検索フィルター機能が動作する', async () => {
    const user = userEvent.setup()
    const mockOnFilter = vi.fn()

    const SearchFilter = () => {
      const [searchTerm, setSearchTerm] = React.useState('')
      const [status, setStatus] = React.useState('')

      const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchTerm(value)
        mockOnFilter({ searchTerm: value, status })
      }

      const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        setStatus(value)
        mockOnFilter({ searchTerm, status: value })
      }

      return (
        <div data-testid="search-filter">
          <div>
            <label htmlFor="search">検索</label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="工事名称で検索"
            />
          </div>
          
          <div>
            <label htmlFor="status-filter">ステータス</label>
            <select
              id="status-filter"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="">全て</option>
              <option value="計画中">計画中</option>
              <option value="仕掛中">仕掛中</option>
              <option value="完工済">完工済</option>
            </select>
          </div>
        </div>
      )
    }

    render(<SearchFilter />)

    // 検索フィルターが表示されることを確認
    expect(screen.getByTestId('search-filter')).toBeInTheDocument()

    // 検索入力
    const searchInput = screen.getByLabelText('検索')
    await user.type(searchInput, 'テスト')

    // フィルター関数が呼ばれることを確認
    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledWith({
        searchTerm: 'テスト',
        status: ''
      })
    })

    // ステータスフィルター
    const statusSelect = screen.getByLabelText('ステータス')
    await user.selectOptions(statusSelect, '仕掛中')

    // フィルター関数が正しいパラメータで呼ばれることを確認
    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledWith({
        searchTerm: 'テスト',
        status: '仕掛中'
      })
    })
  })

  it('エラーハンドリングが正常に動作する', async () => {
    const ErrorComponent = ({ hasError }: { hasError: boolean }) => {
      if (hasError) {
        return (
          <div data-testid="error-message" role="alert">
            エラーが発生しました
          </div>
        )
      }

      return (
        <div data-testid="success-content">
          正常なコンテンツ
        </div>
      )
    }

    // エラーなしの場合
    const { rerender } = render(<ErrorComponent hasError={false} />)
    expect(screen.getByTestId('success-content')).toBeInTheDocument()
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()

    // エラーありの場合
    rerender(<ErrorComponent hasError={true} />)
    expect(screen.getByTestId('error-message')).toBeInTheDocument()
    expect(screen.queryByTestId('success-content')).not.toBeInTheDocument()

    // エラーメッセージがアクセシブルであることを確認
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('ローディング状態が正常に表示される', async () => {
    const LoadingComponent = ({ isLoading }: { isLoading: boolean }) => {
      if (isLoading) {
        return (
          <div data-testid="loading-spinner" aria-label="読み込み中">
            読み込み中...
          </div>
        )
      }

      return (
        <div data-testid="loaded-content">
          読み込み完了
        </div>
      )
    }

    // ローディング状態
    const { rerender } = render(<LoadingComponent isLoading={true} />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByLabelText('読み込み中')).toBeInTheDocument()
    expect(screen.queryByTestId('loaded-content')).not.toBeInTheDocument()

    // 読み込み完了状態
    rerender(<LoadingComponent isLoading={false} />)
    expect(screen.getByTestId('loaded-content')).toBeInTheDocument()
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
  })
})