import { Suspense, useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './components/auth/AuthProvider'
import PrivateRoute from './components/auth/PrivateRoute'
import ConstructionProjectApp from './components/ConstructionProjectApp'
import { ToastProvider } from './contexts/ToastContext'
import ToastContainer from './components/common/ToastContainer'
import LoadingSpinner from './components/common/LoadingSpinner'
import { queryClient } from './lib/queryClient'
import { measureCoreWebVitals, checkPerformanceWarnings } from './utils/performance'

function App() {
  useEffect(() => {
    // パフォーマンス監視を開始（開発環境のみ）
    if (import.meta.env.DEV) {
      measureCoreWebVitals()
      
      // ページ読み込み完了後にパフォーマンスチェック
      const timer = setTimeout(() => {
        checkPerformanceWarnings()
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <PrivateRoute>
              <ConstructionProjectApp />
            </PrivateRoute>
          </Suspense>
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
