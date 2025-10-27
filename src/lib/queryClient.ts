import { QueryClient } from '@tanstack/react-query'

// 最適化されたReact Queryクライアント設定
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // キャッシュ時間を最適化
      staleTime: 5 * 60 * 1000, // 5分
      gcTime: 10 * 60 * 1000, // 10分（旧cacheTime）
      
      // エラー時の再試行設定
      retry: (failureCount, error: any) => {
        // 認証エラーの場合は再試行しない
        if (error?.status === 401 || error?.status === 403) {
          return false
        }
        // 3回まで再試行
        return failureCount < 3
      },
      
      // 再試行間隔
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // バックグラウンドでの再取得を制御
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true
    },
    mutations: {
      // ミューテーション時の再試行設定
      retry: 1,
      retryDelay: 1000
    }
  }
})

// 開発環境でのデバッグ設定
if (import.meta.env.DEV) {
  queryClient.setDefaultOptions({
    queries: {
      ...queryClient.getDefaultOptions().queries,
      refetchOnWindowFocus: true // 開発時はフォーカス時に再取得
    }
  })
}