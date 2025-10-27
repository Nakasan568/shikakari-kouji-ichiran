import React, { ReactNode } from 'react'
import { useAuthContext } from './AuthProvider'
import LoginForm from './LoginForm'
import Layout from '../layout/Layout'

interface PrivateRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function PrivateRoute({ children, fallback }: PrivateRouteProps) {
  const { isAuthenticated, loading } = useAuthContext()

  // ローディング中の表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  // 未認証の場合はログインフォームを表示
  if (!isAuthenticated) {
    return fallback || <LoginForm />
  }

  // 認証済みの場合は新しいレイアウトで子コンポーネントを表示
  return (
    <Layout>
      {children}
    </Layout>
  )
}