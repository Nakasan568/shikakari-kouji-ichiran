import React, { createContext, useContext, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { useAuth } from '../../hooks/useAuth'
import type { LoginFormData } from '../../types'

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (credentials: LoginFormData) => Promise<{ error: AuthError | null }>
  signUp: (credentials: LoginFormData) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  clearError: () => void
  isAuthenticated: boolean
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// AuthProviderコンポーネントのProps
interface AuthProviderProps {
  children: ReactNode
}

// AuthProviderコンポーネント
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  const contextValue: AuthContextType = {
    ...auth,
    isAuthenticated: !!auth.user
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// 認証コンテキストを使用するためのカスタムフック
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
}

// 認証が必要なコンポーネントをラップするHOC
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuthContext()

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                認証が必要です
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                このページにアクセスするにはログインが必要です
              </p>
            </div>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

// 認証状態に応じてコンテンツを表示するコンポーネント
interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ 
  children, 
  fallback, 
  requireAuth = true 
}: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              ログインが必要です
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              このページにアクセスするにはログインしてください
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!requireAuth && isAuthenticated) {
    return fallback || null
  }

  return <>{children}</>
}