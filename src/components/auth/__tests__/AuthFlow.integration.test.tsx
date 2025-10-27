import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../test/utils'
import { AuthProvider } from '../AuthProvider'
import LoginForm from '../LoginForm'
import PrivateRoute from '../PrivateRoute'

// Supabase認証のモック
const mockAuth = {
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } }
  }))
}

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: mockAuth
  }
}))

describe('認証フロー統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('未認証状態', () => {
    beforeEach(() => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })
    })

    it('未認証ユーザーにはログインフォームが表示される', async () => {
      render(
        <AuthProvider>
          <PrivateRoute>
            <div>保護されたコンテンツ</div>
          </PrivateRoute>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('ログイン')).toBeInTheDocument()
        expect(screen.queryByText('保護されたコンテンツ')).not.toBeInTheDocument()
      })
    })

    it('ログインフォームでサインアップモードに切り替えできる', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <LoginForm onSuccess={() => {}} />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('ログイン')).toBeInTheDocument()
      })

      const toggleButton = screen.getByText('アカウントをお持ちでない方はこちら')
      await user.click(toggleButton)

      expect(screen.getByText('アカウント作成')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'アカウント作成' })).toBeInTheDocument()
    })
  })

  describe('ログインプロセス', () => {
    it('正常なログインフローが動作する', async () => {
      const user = userEvent.setup()
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      }

      // 初期状態は未認証
      mockAuth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null
      })

      // ログイン成功をモック
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null
      })

      // 認証状態変更をモック
      let authStateCallback: any
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      const mockOnSuccess = vi.fn()

      render(
        <AuthProvider>
          <LoginForm onSuccess={mockOnSuccess} />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
      })

      // ログインフォームに入力
      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'password123')

      const loginButton = screen.getByRole('button', { name: 'ログイン' })
      await user.click(loginButton)

      // ログイン処理が呼ばれることを確認
      await waitFor(() => {
        expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })

      // 認証状態変更をシミュレート
      if (authStateCallback) {
        authStateCallback('SIGNED_IN', { user: mockUser })
      }

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('ログインエラーが適切に処理される', async () => {
      const user = userEvent.setup()

      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      })

      render(
        <AuthProvider>
          <LoginForm onSuccess={() => {}} />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'wrongpassword')

      const loginButton = screen.getByRole('button', { name: 'ログイン' })
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText('ログインエラー')).toBeInTheDocument()
        expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
      })
    })
  })

  describe('認証済み状態', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com'
    }

    beforeEach(() => {
      mockAuth.getSession.mockResolvedValue({
        data: { 
          session: { 
            user: mockUser,
            access_token: 'mock-token'
          } 
        },
        error: null
      })
    })

    it('認証済みユーザーには保護されたコンテンツが表示される', async () => {
      render(
        <AuthProvider>
          <PrivateRoute>
            <div>保護されたコンテンツ</div>
          </PrivateRoute>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument()
        expect(screen.queryByText('ログイン')).not.toBeInTheDocument()
      })
    })

    it('ログアウト機能が正常に動作する', async () => {
      const user = userEvent.setup()

      mockAuth.signOut.mockResolvedValue({ error: null })

      render(
        <AuthProvider>
          <PrivateRoute>
            <div>保護されたコンテンツ</div>
          </PrivateRoute>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument()
      })

      const logoutButton = screen.getByRole('button', { name: /ログアウト/ })
      await user.click(logoutButton)

      // 確認ダイアログをモック
      window.confirm = vi.fn(() => true)

      await waitFor(() => {
        expect(mockAuth.signOut).toHaveBeenCalled()
      })
    })
  })

  describe('サインアップフロー', () => {
    it('新規ユーザー登録が正常に動作する', async () => {
      const user = userEvent.setup()

      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null
      })

      render(
        <AuthProvider>
          <LoginForm onSuccess={() => {}} showSignUp={true} />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('アカウント作成')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/メールアドレス/), 'newuser@example.com')
      await user.type(screen.getByLabelText(/パスワード/), 'newpassword123')

      const signUpButton = screen.getByRole('button', { name: 'アカウント作成' })
      await user.click(signUpButton)

      await waitFor(() => {
        expect(mockAuth.signUp).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'newpassword123'
        })
      })
    })
  })

  describe('セッション管理', () => {
    it('セッション期限切れが適切に処理される', async () => {
      // 初期状態は認証済み
      mockAuth.getSession.mockResolvedValueOnce({
        data: { 
          session: { 
            user: { id: 'user-123', email: 'test@example.com' },
            access_token: 'mock-token'
          } 
        },
        error: null
      })

      let authStateCallback: any
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(
        <AuthProvider>
          <PrivateRoute>
            <div>保護されたコンテンツ</div>
          </PrivateRoute>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument()
      })

      // セッション期限切れをシミュレート
      if (authStateCallback) {
        authStateCallback('SIGNED_OUT', null)
      }

      await waitFor(() => {
        expect(screen.getByText('ログイン')).toBeInTheDocument()
        expect(screen.queryByText('保護されたコンテンツ')).not.toBeInTheDocument()
      })
    })
  })
})