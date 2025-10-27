import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // バンドルサイズ最適化
    rollupOptions: {
      output: {
        manualChunks: {
          // ベンダーライブラリを分離
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@tanstack/react-query', 'react-hook-form', 'react-router-dom'],
          utils: ['zod']
        }
      }
    },
    // 圧縮設定
    minify: 'esbuild',
    // チャンクサイズ警告の閾値を調整
    chunkSizeWarningLimit: 1000
  },
  // 開発サーバー最適化
  server: {
    hmr: {
      overlay: false
    }
  },
  // 依存関係の事前バンドル最適化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react-hook-form',
      'react-router-dom',
      'zod'
    ]
  }
})
