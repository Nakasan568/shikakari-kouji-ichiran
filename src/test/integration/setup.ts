import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup()
})

// 統合テスト用のグローバル設定
beforeAll(() => {
  // テスト環境の初期化
  console.log('統合テスト環境を初期化しています...')
})

afterAll(() => {
  // テスト環境のクリーンアップ
  console.log('統合テスト環境をクリーンアップしています...')
})

// 各テスト前の共通設定
beforeEach(() => {
  // モックのリセット
  vi.clearAllMocks()
  
  // ローカルストレージのクリア
  localStorage.clear()
  sessionStorage.clear()
})

// テスト用のヘルパー関数
export const setupIntegrationTest = () => {
  // 統合テスト用の共通設定
  return {
    // テスト用のSupabaseクライアントモック
    mockSupabaseClient: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
            }))
          }))
        })),
        insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      auth: {
        getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
        getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        signInWithPassword: vi.fn(() => Promise.resolve({ data: null, error: null })),
        signUp: vi.fn(() => Promise.resolve({ data: null, error: null })),
        signOut: vi.fn(() => Promise.resolve({ error: null })),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } }
        }))
      }
    }
  }
}

// エラーハンドリングのテスト用ヘルパー
export const simulateNetworkError = () => {
  return new Error('Network Error: Failed to fetch')
}

export const simulateAuthError = () => {
  return new Error('Auth Error: Invalid credentials')
}

export const simulateValidationError = (field: string) => {
  return new Error(`Validation Error: ${field} is required`)
}

// 非同期処理のテスト用ヘルパー
export const waitForAsyncOperation = (ms: number = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// フォームテスト用ヘルパー
export const fillFormFields = async (user: any, fields: Record<string, string>) => {
  for (const [name, value] of Object.entries(fields)) {
    const field = document.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (field) {
      await user.clear(field)
      await user.type(field, value)
    }
  }
}

// テーブルテスト用ヘルパー
export const getTableRowCount = () => {
  return document.querySelectorAll('[data-testid="project-row"]').length
}

export const getTableCellText = (rowIndex: number, cellIndex: number) => {
  const rows = document.querySelectorAll('[data-testid="project-row"]')
  const row = rows[rowIndex]
  if (row) {
    const cells = row.querySelectorAll('td')
    return cells[cellIndex]?.textContent || ''
  }
  return ''
}