import { test, expect } from '@playwright/test'

test.describe('認証フローE2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // テスト前にローカルストレージをクリア
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('ログインフローが正常に動作する', async ({ page }) => {
    await page.goto('/')

    // ログインページが表示されることを確認
    await expect(page.locator('h1')).toContainText('ログイン')
    
    // ログインフォームが表示されることを確認
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // フォームにテストデータを入力
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')

    // ログインボタンをクリック
    await page.click('button[type="submit"]')

    // ログイン成功後、ダッシュボードにリダイレクトされることを確認
    // 注意: 実際のSupabase認証が必要なため、モック環境では適切に調整が必要
    await expect(page).toHaveURL(/\/dashboard/)
    
    // ヘッダーにユーザー情報が表示されることを確認
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('無効な認証情報でログインが失敗する', async ({ page }) => {
    await page.goto('/')

    // 無効な認証情報を入力
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')

    // ログインボタンをクリック
    await page.click('button[type="submit"]')

    // エラーメッセージが表示されることを確認
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ログインに失敗しました')
    
    // ログインページに留まることを確認
    await expect(page.locator('h1')).toContainText('ログイン')
  })

  test('必須項目未入力でバリデーションエラーが表示される', async ({ page }) => {
    await page.goto('/')

    // 空のフォームで送信
    await page.click('button[type="submit"]')

    // バリデーションエラーが表示されることを確認
    await expect(page.locator('[data-testid="email-error"]')).toContainText('メールアドレスは必須です')
    await expect(page.locator('[data-testid="password-error"]')).toContainText('パスワードは必須です')
  })

  test('ログアウト機能が正常に動作する', async ({ page }) => {
    // 認証済み状態をシミュレート（実際の実装では適切な認証が必要）
    await page.goto('/')
    
    // ローカルストレージに認証情報を設定（テスト用）
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'test-token',
        user: { id: '123', email: 'test@example.com' }
      }))
    })

    await page.reload()

    // ダッシュボードが表示されることを確認
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible()

    // ユーザーメニューをクリック
    await page.click('[data-testid="user-menu"]')

    // ログアウトボタンをクリック
    await page.click('[data-testid="logout-button"]')

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toContainText('ログイン')
  })

  test('未認証ユーザーが保護されたページにアクセスできない', async ({ page }) => {
    // 直接ダッシュボードにアクセスを試行
    await page.goto('/dashboard')

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toContainText('ログイン')
  })

  test('セッション期限切れ時に適切に処理される', async ({ page }) => {
    // 認証済み状態をシミュレート
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'expired-token',
        user: { id: '123', email: 'test@example.com' }
      }))
    })

    await page.reload()

    // 期限切れトークンでAPIリクエストが失敗した場合の処理を確認
    // 実際の実装では、APIエラーレスポンスに基づいてログアウト処理が実行される
    await page.waitForTimeout(1000)

    // セッション期限切れの場合、ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/')
  })

  test('レスポンシブデザインでログインフォームが正常に表示される', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // モバイルでもログインフォームが適切に表示されることを確認
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // フォームが画面に収まることを確認
    const loginForm = page.locator('form')
    const boundingBox = await loginForm.boundingBox()
    expect(boundingBox?.width).toBeLessThanOrEqual(375)
  })

  test('キーボードナビゲーションが正常に動作する', async ({ page }) => {
    await page.goto('/')

    // Tabキーでフォーカス移動
    await page.keyboard.press('Tab')
    await expect(page.locator('input[type="email"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('input[type="password"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('button[type="submit"]')).toBeFocused()

    // Enterキーでフォーム送信
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.keyboard.press('Enter')

    // フォームが送信されることを確認
    await page.waitForTimeout(500)
  })
})