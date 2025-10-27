import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// 簡単な統合テスト例
describe('統合テスト - 基本機能', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('基本的なレンダリングが動作する', () => {
    const TestComponent = () => <div>テストコンポーネント</div>
    
    render(<TestComponent />)
    
    expect(screen.getByText('テストコンポーネント')).toBeInTheDocument()
  })

  it('ユーザーインタラクションが動作する', async () => {
    const user = userEvent.setup()
    const mockClick = vi.fn()
    
    const TestComponent = () => (
      <button onClick={mockClick}>クリックボタン</button>
    )
    
    render(<TestComponent />)
    
    const button = screen.getByRole('button', { name: 'クリックボタン' })
    await user.click(button)
    
    expect(mockClick).toHaveBeenCalledTimes(1)
  })

  it('フォーム入力が動作する', async () => {
    const user = userEvent.setup()
    const mockSubmit = vi.fn()
    
    const TestForm = () => (
      <form onSubmit={(e) => { e.preventDefault(); mockSubmit() }}>
        <input name="test" placeholder="テスト入力" />
        <button type="submit">送信</button>
      </form>
    )
    
    render(<TestForm />)
    
    const input = screen.getByPlaceholderText('テスト入力')
    const button = screen.getByRole('button', { name: '送信' })
    
    await user.type(input, 'テストデータ')
    await user.click(button)
    
    expect(mockSubmit).toHaveBeenCalledTimes(1)
    expect(input).toHaveValue('テストデータ')
  })

  it('条件付きレンダリングが動作する', () => {
    const TestComponent = ({ showContent }: { showContent: boolean }) => (
      <div>
        {showContent && <span>条件付きコンテンツ</span>}
        <span>常に表示されるコンテンツ</span>
      </div>
    )
    
    const { rerender } = render(<TestComponent showContent={false} />)
    
    expect(screen.queryByText('条件付きコンテンツ')).not.toBeInTheDocument()
    expect(screen.getByText('常に表示されるコンテンツ')).toBeInTheDocument()
    
    rerender(<TestComponent showContent={true} />)
    
    expect(screen.getByText('条件付きコンテンツ')).toBeInTheDocument()
    expect(screen.getByText('常に表示されるコンテンツ')).toBeInTheDocument()
  })

  it('非同期処理が動作する', async () => {
    const TestComponent = () => {
      const [loading, setLoading] = React.useState(false)
      const [data, setData] = React.useState('')
      
      const handleClick = async () => {
        setLoading(true)
        // 非同期処理をシミュレート
        await new Promise(resolve => setTimeout(resolve, 100))
        setData('読み込み完了')
        setLoading(false)
      }
      
      return (
        <div>
          <button onClick={handleClick}>データ読み込み</button>
          {loading && <span>読み込み中...</span>}
          {data && <span>{data}</span>}
        </div>
      )
    }
    
    const user = userEvent.setup()
    render(<TestComponent />)
    
    const button = screen.getByRole('button', { name: 'データ読み込み' })
    await user.click(button)
    
    // ローディング状態を確認
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    
    // 完了状態を確認
    await screen.findByText('読み込み完了')
    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
  })
})

// React のインポートを追加
import React from 'react'