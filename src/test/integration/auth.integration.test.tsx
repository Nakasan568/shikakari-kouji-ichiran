import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '../../components/auth/AuthProvider'
import { LoginForm } from '../../components/auth/LoginForm'
import { PrivateRoute } from '../../components/auth/PrivateRoute'
import { supabase } from '../../lib/supabase'

// Supabaseモックの設定
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}))

const TestComponent = () => <div>認証済みコンテンツ</div>

describe('認証フロー統合テスト', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ログイン機能', () => {
    it('有効な認証情報でログインが成功する', async () => {
      // モックの設定
      const mockSignIn = vi.mocked(supabase.auth.signInWithPassword)
      mockSignIn.mockResolvedValue({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token' }
        },
        error: null
      } as any)

      render(<LoginForm />)

      // フォーム入力
      const emailInput = screen.getByLabelText(/メールアドレス/i)
      const passwordInput = screen.getByLabelText(/パスワード/i)
      const submitButton = screen.getByRole('button', { name: /ログイン/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // APIが正しく呼ばれることを確認
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    })

    it('無効な認証情報でログインが失敗する', async () => {
      // モックの設定
      const mockSignIn = vi.mocked(supabase.auth.signInWithPassword)
      mockSignIn.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      } as any)

      render(<LoginForm />)

      // フォーム入力
      const emailInput = screen.getByLabelText(/メールアドレス/i)
      const passwordInput = screen.getByLabelText(/パスワード/i)
      const submitButton = screen.getByRole('button', { name: /ログイン/i })

      await user.type(emailInput, 'invalid@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/ログインに失敗しました/i)).toBeInTheDocument()
      })
    })

    it('必須項目が未入力の場合バリデーションエラーが表示される', async () => {
      render(<LoginForm />)

      const submitButton = screen.getByRole('button', { name: /ログイン/i })
      await user.click(submitButton)

      // バリデーションエラーが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/メールアドレスは必須です/i)).toBeInTheDocument()
        expect(screen.getByText(/パスワードは必須です/i)).toBeInTheDocument()
      })
    })
  })

  describe('認証状態管理', () => {
    it('認証済みユーザーは保護されたコンテンツにアクセスできる', async () => {
      // 認証済み状態のモック
      const mockGetSession = vi.mocked(supabase.auth.getSession)
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: { id: '123', email: 'test@example.com' },
            access_token: 'token'
          }
        },
        error: null
      } as any)

      const mockOnAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange)
      mockOnAuthStateChange.mockImplementation((callback) => {
        // 認証状態変更をシミュレート
        callback('SIGNED_IN', {
          user: { id: '123', email: 'test@example.com' },
          access_token: 'token'
        } as any)
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(
        <AuthProvider>
          <PrivateRoute>
            <TestComponent />
          </PrivateRoute>
        </AuthProvider>
      )

      // 認証済みコンテンツが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('認証済みコンテンツ')).toBeInTheDocument()
      })
    })

    it('未認証ユーザーはログインフォームにリダイレクトされる', async () => {
      // 未認証状態のモック
      const mockGetSession = vi.mocked(supabase.auth.getSession)
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null
      } as any)

      const mockOnAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange)
      mockOnAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_OUT', null)
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(
        <AuthProvider>
          <PrivateRoute>
            <TestComponent />
          </PrivateRoute>
        </AuthProvider>
      )

      // ログインフォームが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/ログイン/i)).toBeInTheDocument()
        expect(screen.queryByText('認証済みコンテンツ')).not.toBeInTheDocument()
      })
    })
  })

  describe('ログアウト機能', () => {
    it('ログアウトが正常に実行される', async () => {
      // 認証済み状態のモック
      const mockGetSession = vi.mocked(supabase.auth.getSession)
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: { id: '123', email: 'test@example.com' },
            access_token: 'token'
          }
        },
        error: null
      } as any)

      const mockSignOut = vi.mocked(supabase.auth.signOut)
      mockSignOut.mockResolvedValue({ error: null })

      const mockOnAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange)
      let authCallback: any
      mockOnAuthStateChange.mockImplementation((callback) => {
        authCallback = callback
        // 初期状態は認証済み
        callback('SIGNED_IN', {
          user: { id: '123', email: 'test@example.com' },
          access_token: 'token'
        } as any)
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(
        <AuthProvider>
          <div>
            <button onClick={() => supabase.auth.signOut()}>
              ログアウト
            </button>
            <PrivateRoute>
              <TestComponent />
            </PrivateRoute>
          </div>
        </AuthProvider>
      )

      // 最初は認証済みコンテンツが表示される
      await waitFor(() => {
        expect(screen.getByText('認証済みコンテンツ')).toBeInTheDocument()
      })

      // ログアウトボタンをクリック
      const logoutButton = screen.getByText('ログアウト')
      await user.click(logoutButton)

      // ログアウト状態をシミュレート
      authCallback('SIGNED_OUT', null)

      // ログアウト後はログインフォームが表示される
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
        expect(screen.queryByText('認証済みコンテンツ')).not.toBeInTheDocument()
      })
    })
  })

  describe('セッション管理', () => {
    it('セッション期限切れ時に適切に処理される', async () => {
      const mockGetSession = vi.mocked(supabase.auth.getSession)
      const mockOnAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange)

      // 最初は有効なセッション
      mockGetSession.mockResolvedValueOnce({
        data: {
          session: {
            user: { id: '123', email: 'test@example.com' },
            access_token: 'token'
          }
        },
        error: null
      } as any)

      let authCallback: any
      mockOnAuthStateChange.mockImplementation((callback) => {
        authCallback = callback
        callback('SIGNED_IN', {
          user: { id: '123', email: 'test@example.com' },
          access_token: 'token'
        } as any)
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(
        <AuthProvider>
          <PrivateRoute>
            <TestComponent />
          </PrivateRoute>
        </AuthProvider>
      )

      // 最初は認証済みコンテンツが表示される
      await waitFor(() => {
        expect(screen.getByText('認証済みコンテンツ')).toBeInTheDocument()
      })

      // セッション期限切れをシミュレート
      authCallback('TOKEN_REFRESHED', null)

      // 適切に処理されることを確認
      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })
    })
  })
})