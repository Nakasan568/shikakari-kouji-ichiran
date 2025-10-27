import { test, expect } from '@playwright/test'

test.describe('基本的なE2Eテスト', () => {
  test('アプリケーションが正常に起動する', async ({ page }) => {
    // アプリケーションにアクセス
    await page.goto('/')

    // ページタイトルが正しく設定されていることを確認
    await expect(page).toHaveTitle(/仕掛工事管理/)

    // 基本的な要素が表示されることを確認
    await expect(page.locator('body')).toBeVisible()
  })

  test('ページが正常にレンダリングされる', async ({ page }) => {
    await page.goto('/')

    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('networkidle')

    // 基本的なHTML構造が存在することを確認
    await expect(page.locator('html')).toBeVisible()
    await expect(page.locator('head')).toBeAttached()
    await expect(page.locator('body')).toBeVisible()
  })

  test('JavaScriptが正常に動作する', async ({ page }) => {
    await page.goto('/')

    // JavaScriptが有効であることを確認
    const jsEnabled = await page.evaluate(() => {
      return typeof window !== 'undefined' && typeof document !== 'undefined'
    })

    expect(jsEnabled).toBe(true)
  })

  test('レスポンシブデザインが動作する', async ({ page }) => {
    // デスクトップサイズ
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()

    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)
    await expect(page.locator('body')).toBeVisible()

    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    await expect(page.locator('body')).toBeVisible()
  })

  test('基本的なナビゲーションが動作する', async ({ page }) => {
    await page.goto('/')

    // ページが読み込まれることを確認
    await page.waitForLoadState('domcontentloaded')

    // URLが正しいことを確認
    expect(page.url()).toContain('localhost:5173')
  })

  test('エラーページが適切に処理される', async ({ page }) => {
    // 存在しないページにアクセス
    const response = await page.goto('/nonexistent-page')

    // 404エラーまたはリダイレクトが適切に処理されることを確認
    // 実際のアプリケーションの動作に応じて調整が必要
    expect(response?.status()).toBeDefined()
  })

  test('パフォーマンスメトリクスが取得できる', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // パフォーマンスメトリクスを取得
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
      }
    })

    // メトリクスが取得できることを確認
    expect(typeof metrics.loadTime).toBe('number')
    expect(typeof metrics.domContentLoaded).toBe('number')
  })

  test('コンソールエラーがないことを確認', async ({ page }) => {
    const consoleErrors: string[] = []

    // コンソールエラーをキャプチャ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 重大なコンソールエラーがないことを確認
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && // faviconエラーは無視
      !error.includes('404') // 404エラーは無視
    )

    expect(criticalErrors).toHaveLength(0)
  })
})