import React from 'react'
import { render } from '@testing-library/react'
import { ToastProvider } from '../contexts/ToastContext'
import { AuthProvider } from '../components/auth/AuthProvider'

// テスト用のプロバイダーラッパー
const AllTheProviders = ({ children }: { children: any }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ToastProvider>
  )
}

// カスタムレンダー関数
const customRender = (
  ui: React.ReactElement,
  options?: any
) => render(ui, { wrapper: AllTheProviders, ...options })

// テスト用のモックデータ
export const mockProject = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'テスト工事',
  customer_name: 'テスト顧客',
  assignee: 'テスト担当者',
  contract_amount: 10000000,
  execution_budget: 9000000,
  planned_start_date: '2024-01-01',
  planned_completion_date: '2024-06-30',
  status: '仕掛中' as const,
  notes: 'テスト用の特記事項',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

export const mockEmployee = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'テスト社員',
  email: 'test@example.com',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174002',
  email: 'user@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

// テスト用のヘルパー関数
export const createMockProjects = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockProject,
    id: `project-${index}`,
    name: `テスト工事 ${index + 1}`,
    contract_amount: 10000000 + (index * 1000000),
    status: ['計画中', '仕掛中', '完工済'][index % 3] as const
  }))
}

export const createMockEmployees = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockEmployee,
    id: `employee-${index}`,
    name: `テスト社員 ${index + 1}`,
    email: `employee${index + 1}@example.com`
  }))
}

// 非同期処理のテスト用ヘルパー
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// フォーム入力のヘルパー
export const fillForm = async (user: any, formData: Record<string, string>) => {
  for (const [field, value] of Object.entries(formData)) {
    const input = document.querySelector(`[name="${field}"]`) as HTMLInputElement
    if (input) {
      await user.clear(input)
      await user.type(input, value)
    }
  }
}

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }