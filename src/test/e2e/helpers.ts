import { Page, expect } from '@playwright/test'

/**
 * E2Eテスト用のヘルパー関数集
 */

/**
 * 認証済み状態をシミュレートする
 */
export const simulateAuthenticatedUser = async (page: Page, user = {
  id: '123',
  email: 'test@example.com'
}) => {
  await page.evaluate((userData) => {
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'test-token',
      user: userData
    }))
  }, user)
}

/**
 * ログイン処理を実行する
 */
export const performLogin = async (page: Page, email = 'test@example.com', password = 'testpassword123') => {
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
}

/**
 * 工事データフォームに入力する
 */
export const fillProjectForm = async (page: Page, projectData: {
  name: string
  customer_name?: string
  assignee: string
  contract_amount: string
  execution_budget: string
  planned_start_date?: string
  planned_completion_date?: string
  status: string
  notes?: string
}) => {
  await page.fill('[name="name"]', projectData.name)
  
  if (projectData.customer_name) {
    await page.fill('[name="customer_name"]', projectData.customer_name)
  }
  
  await page.selectOption('[name="assignee"]', projectData.assignee)
  await page.fill('[name="contract_amount"]', projectData.contract_amount)
  await page.fill('[name="execution_budget"]', projectData.execution_budget)
  
  if (projectData.planned_start_date) {
    await page.fill('[name="planned_start_date"]', projectData.planned_start_date)
  }
  
  if (projectData.planned_completion_date) {
    await page.fill('[name="planned_completion_date"]', projectData.planned_completion_date)
  }
  
  await page.selectOption('[name="status"]', projectData.status)
  
  if (projectData.notes) {
    await page.fill('[name="notes"]', projectData.notes)
  }
}

/**
 * テーブルの行数を取得する
 */
export const getTableRowCount = async (page: Page) => {
  return await page.locator('[data-testid="project-row"]').count()
}

/**
 * 特定の行のセルテキストを取得する
 */
export const getCellText = async (page: Page, rowIndex: number, cellIndex: number) => {
  const row = page.locator('[data-testid="project-row"]').nth(rowIndex)
  const cell = row.locator('td').nth(cellIndex)
  return await cell.textContent()
}

/**
 * 検索フィルターを適用する
 */
export const applySearchFilter = async (page: Page, searchTerm: string) => {
  await page.fill('[data-testid="search-input"]', searchTerm)
  await page.waitForTimeout(500) // デバウンス待機
}

/**
 * ステータスフィルターを適用する
 */
export const applyStatusFilter = async (page: Page, status: string) => {
  await page.selectOption('[data-testid="status-filter"]', status)
  await page.waitForTimeout(500)
}

/**
 * 日付範囲フィルターを適用する
 */
export const applyDateRangeFilter = async (page: Page, fromDate: string, toDate: string) => {
  await page.fill('[data-testid="date-from"]', fromDate)
  await page.fill('[data-testid="date-to"]', toDate)
  await page.waitForTimeout(500)
}

/**
 * トーストメッセージが表示されることを確認する
 */
export const expectToastMessage = async (page: Page, message: string, type: 'success' | 'error' | 'info' = 'success') => {
  await expect(page.locator(`[data-testid="toast-${type}"]`)).toContainText(message)
}

/**
 * ローディング状態が完了するまで待機する
 */
export const waitForLoadingToComplete = async (page: Page) => {
  await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' })
}

/**
 * 確認ダイアログで確認する
 */
export const confirmDialog = async (page: Page) => {
  await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
  await page.click('[data-testid="confirm-delete-button"]')
}

/**
 * 確認ダイアログでキャンセルする
 */
export const cancelDialog = async (page: Page) => {
  await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
  await page.click('[data-testid="cancel-delete-button"]')
}

/**
 * フォームバリデーションエラーを確認する
 */
export const expectValidationErrors = async (page: Page, errors: Record<string, string>) => {
  for (const [field, message] of Object.entries(errors)) {
    await expect(page.locator(`[data-testid="${field}-error"]`)).toContainText(message)
  }
}

/**
 * レスポンシブビューポートを設定する
 */
export const setMobileViewport = async (page: Page) => {
  await page.setViewportSize({ width: 375, height: 667 })
}

export const setTabletViewport = async (page: Page) => {
  await page.setViewportSize({ width: 768, height: 1024 })
}

export const setDesktopViewport = async (page: Page) => {
  await page.setViewportSize({ width: 1280, height: 720 })
}

/**
 * モバイルメニューを開く
 */
export const openMobileMenu = async (page: Page) => {
  await page.click('[data-testid="mobile-menu-button"]')
  await expect(page.locator('[data-testid="mobile-sidebar"]')).toBeVisible()
}

/**
 * ページネーションを操作する
 */
export const goToNextPage = async (page: Page) => {
  await page.click('[data-testid="next-page"]')
  await page.waitForTimeout(500)
}

export const goToPreviousPage = async (page: Page) => {
  await page.click('[data-testid="prev-page"]')
  await page.waitForTimeout(500)
}

export const goToPage = async (page: Page, pageNumber: number) => {
  await page.click(`[data-testid="page-${pageNumber}"]`)
  await page.waitForTimeout(500)
}

/**
 * ネットワークエラーをシミュレートする
 */
export const simulateNetworkError = async (page: Page, url: string) => {
  await page.route(url, route => {
    route.abort('failed')
  })
}

/**
 * APIレスポンスをモックする
 */
export const mockApiResponse = async (page: Page, url: string, response: any) => {
  await page.route(url, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    })
  })
}

/**
 * キーボードナビゲーションをテストする
 */
export const testKeyboardNavigation = async (page: Page, elements: string[]) => {
  for (const element of elements) {
    await page.keyboard.press('Tab')
    await expect(page.locator(element)).toBeFocused()
  }
}

/**
 * アクセシビリティをテストする
 */
export const testAccessibility = async (page: Page) => {
  // フォーカス可能な要素がキーボードでアクセス可能であることを確認
  const focusableElements = await page.locator('button, input, select, textarea, a[href]').all()
  
  for (const element of focusableElements) {
    if (await element.isVisible()) {
      await element.focus()
      await expect(element).toBeFocused()
    }
  }
}

/**
 * パフォーマンスメトリクスを取得する
 */
export const getPerformanceMetrics = async (page: Page) => {
  return await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
    }
  })
}

/**
 * スクリーンショットを撮影する
 */
export const takeScreenshot = async (page: Page, name: string) => {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true })
}

/**
 * テストデータを生成する
 */
export const generateTestProjectData = (index: number = 1) => ({
  name: `E2Eテスト工事 ${index}`,
  customer_name: `E2Eテスト顧客 ${index}`,
  assignee: 'テスト担当者',
  contract_amount: (10000000 + index * 1000000).toString(),
  execution_budget: (9000000 + index * 1000000).toString(),
  planned_start_date: '2024-03-01',
  planned_completion_date: '2024-09-30',
  status: ['計画中', '仕掛中', '完工済'][index % 3],
  notes: `E2Eテスト用の特記事項 ${index}`
})

/**
 * 複数のテストデータを生成する
 */
export const generateMultipleTestProjects = (count: number) => {
  return Array.from({ length: count }, (_, index) => generateTestProjectData(index + 1))
}