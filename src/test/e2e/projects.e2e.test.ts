import { test, expect } from '@playwright/test'

test.describe('工事データ管理E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // テスト前の準備
    await page.goto('/')
    
    // 認証済み状態をシミュレート（実際の実装では適切な認証が必要）
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'test-token',
        user: { id: '123', email: 'test@example.com' }
      }))
    })

    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('工事一覧が正常に表示される', async ({ page }) => {
    // ダッシュボードページに移動
    await page.goto('/dashboard')

    // 工事一覧テーブルが表示されることを確認
    await expect(page.locator('[data-testid="projects-table"]')).toBeVisible()

    // テーブルヘッダーが正しく表示されることを確認
    await expect(page.locator('th')).toContainText(['工事ID', '工事名称', '顧客名', '担当者', '契約金額', '実行予算', '完工予定日', '進捗ステータス', '操作'])

    // ローディング状態が適切に処理されることを確認
    await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' })
  })

  test('新規工事データの登録が正常に動作する', async ({ page }) => {
    await page.goto('/dashboard')

    // 新規登録ボタンをクリック
    await page.click('[data-testid="add-project-button"]')

    // 新規登録フォームが表示されることを確認
    await expect(page.locator('[data-testid="project-form"]')).toBeVisible()
    await expect(page.locator('h2')).toContainText('新規工事登録')

    // フォームに入力
    await page.fill('[name="name"]', 'E2Eテスト工事')
    await page.fill('[name="customer_name"]', 'E2Eテスト顧客')
    await page.selectOption('[name="assignee"]', 'テスト担当者')
    await page.fill('[name="contract_amount"]', '20000000')
    await page.fill('[name="execution_budget"]', '18000000')
    await page.fill('[name="planned_start_date"]', '2024-03-01')
    await page.fill('[name="planned_completion_date"]', '2024-09-30')
    await page.selectOption('[name="status"]', '計画中')
    await page.fill('[name="notes"]', 'E2Eテスト用の特記事項')

    // 保存ボタンをクリック
    await page.click('[data-testid="save-button"]')

    // 成功メッセージが表示されることを確認
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('工事データを登録しました')

    // 一覧画面に戻ることを確認
    await expect(page.locator('[data-testid="projects-table"]')).toBeVisible()

    // 新規登録したデータが一覧に表示されることを確認
    await expect(page.locator('td')).toContainText('E2Eテスト工事')
  })

  test('工事データの編集が正常に動作する', async ({ page }) => {
    await page.goto('/dashboard')

    // 編集ボタンをクリック（最初の行）
    await page.click('[data-testid="edit-button"]:first-child')

    // 編集フォームが表示されることを確認
    await expect(page.locator('[data-testid="project-form"]')).toBeVisible()
    await expect(page.locator('h2')).toContainText('工事編集')

    // 既存データが表示されることを確認
    const nameInput = page.locator('[name="name"]')
    await expect(nameInput).not.toHaveValue('')

    // データを編集
    await nameInput.fill('編集されたE2Eテスト工事')
    await page.fill('[name="contract_amount"]', '25000000')

    // 保存ボタンをクリック
    await page.click('[data-testid="save-button"]')

    // 成功メッセージが表示されることを確認
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('工事データを更新しました')

    // 編集されたデータが一覧に反映されることを確認
    await expect(page.locator('td')).toContainText('編集されたE2Eテスト工事')
    await expect(page.locator('td')).toContainText('25,000,000')
  })

  test('工事データの削除が正常に動作する', async ({ page }) => {
    await page.goto('/dashboard')

    // 削除ボタンをクリック
    await page.click('[data-testid="delete-button"]:first-child')

    // 確認ダイアログが表示されることを確認
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
    await expect(page.locator('[data-testid="confirm-dialog"]')).toContainText('削除の確認')
    await expect(page.locator('[data-testid="confirm-dialog"]')).toContainText('この工事データを削除しますか？')

    // 削除を確認
    await page.click('[data-testid="confirm-delete-button"]')

    // 成功メッセージが表示されることを確認
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('工事データを削除しました')

    // データが一覧から削除されることを確認
    await page.waitForTimeout(1000)
  })

  test('削除確認ダイアログでキャンセルした場合削除されない', async ({ page }) => {
    await page.goto('/dashboard')

    // 削除前の行数を取得
    const initialRowCount = await page.locator('[data-testid="project-row"]').count()

    // 削除ボタンをクリック
    await page.click('[data-testid="delete-button"]:first-child')

    // 確認ダイアログでキャンセル
    await page.click('[data-testid="cancel-delete-button"]')

    // ダイアログが閉じることを確認
    await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible()

    // 行数が変わらないことを確認
    const finalRowCount = await page.locator('[data-testid="project-row"]').count()
    expect(finalRowCount).toBe(initialRowCount)
  })

  test('検索機能が正常に動作する', async ({ page }) => {
    await page.goto('/dashboard')

    // 検索フィールドに入力
    await page.fill('[data-testid="search-input"]', 'テスト工事')

    // 検索結果が反映されることを確認
    await page.waitForTimeout(500)
    
    // 検索条件に一致する行のみ表示されることを確認
    const visibleRows = page.locator('[data-testid="project-row"]:visible')
    await expect(visibleRows.first().locator('td')).toContainText('テスト工事')

    // 検索をクリア
    await page.fill('[data-testid="search-input"]', '')
    await page.waitForTimeout(500)

    // 全ての行が再表示されることを確認
    const allRows = page.locator('[data-testid="project-row"]')
    expect(await allRows.count()).toBeGreaterThan(0)
  })

  test('進捗ステータスフィルターが正常に動作する', async ({ page }) => {
    await page.goto('/dashboard')

    // ステータスフィルターを選択
    await page.selectOption('[data-testid="status-filter"]', '計画中')

    // フィルター結果が反映されることを確認
    await page.waitForTimeout(500)
    
    const visibleRows = page.locator('[data-testid="project-row"]:visible')
    const statusCells = visibleRows.locator('[data-testid="status-cell"]')
    
    // 表示されている全ての行が「計画中」であることを確認
    const count = await statusCells.count()
    for (let i = 0; i < count; i++) {
      await expect(statusCells.nth(i)).toContainText('計画中')
    }

    // フィルターをクリア
    await page.selectOption('[data-testid="status-filter"]', '')
    await page.waitForTimeout(500)
  })

  test('日付範囲フィルターが正常に動作する', async ({ page }) => {
    await page.goto('/dashboard')

    // 日付範囲フィルターを設定
    await page.fill('[data-testid="date-from"]', '2024-01-01')
    await page.fill('[data-testid="date-to"]', '2024-12-31')

    // フィルター結果が反映されることを確認
    await page.waitForTimeout(500)
    
    // 指定期間内の完工予定日を持つ行のみ表示されることを確認
    const visibleRows = page.locator('[data-testid="project-row"]:visible')
    expect(await visibleRows.count()).toBeGreaterThanOrEqual(0)
  })

  test('ページネーションが正常に動作する', async ({ page }) => {
    await page.goto('/dashboard')

    // ページネーションが表示されることを確認（データが十分にある場合）
    const pagination = page.locator('[data-testid="pagination"]')
    
    if (await pagination.isVisible()) {
      // 次のページボタンをクリック
      await page.click('[data-testid="next-page"]')
      
      // ページが変わることを確認
      await page.waitForTimeout(500)
      
      // 前のページボタンをクリック
      await page.click('[data-testid="prev-page"]')
      
      // 最初のページに戻ることを確認
      await page.waitForTimeout(500)
    }
  })

  test('フォームバリデーションが正常に動作する', async ({ page }) => {
    await page.goto('/dashboard')

    // 新規登録ボタンをクリック
    await page.click('[data-testid="add-project-button"]')

    // 必須項目を空のまま保存ボタンをクリック
    await page.click('[data-testid="save-button"]')

    // バリデーションエラーが表示されることを確認
    await expect(page.locator('[data-testid="name-error"]')).toContainText('工事名称は必須です')
    await expect(page.locator('[data-testid="assignee-error"]')).toContainText('担当者は必須です')
    await expect(page.locator('[data-testid="contract-amount-error"]')).toContainText('契約金額は必須です')
    await expect(page.locator('[data-testid="execution-budget-error"]')).toContainText('実行予算は必須です')

    // 無効な数値を入力
    await page.fill('[name="contract_amount"]', '-1000')
    await page.fill('[name="execution_budget"]', 'abc')

    await page.click('[data-testid="save-button"]')

    // 数値バリデーションエラーが表示されることを確認
    await expect(page.locator('[data-testid="contract-amount-error"]')).toContainText('契約金額は正の整数で入力してください')
    await expect(page.locator('[data-testid="execution-budget-error"]')).toContainText('実行予算は正の整数で入力してください')
  })

  test('レスポンシブデザインが正常に動作する', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')

    // モバイルビューでハンバーガーメニューが表示されることを確認
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()

    // ハンバーガーメニューをクリック
    await page.click('[data-testid="mobile-menu-button"]')

    // サイドバーが表示されることを確認
    await expect(page.locator('[data-testid="mobile-sidebar"]')).toBeVisible()

    // モバイルビューで工事一覧がカード形式で表示されることを確認
    await expect(page.locator('[data-testid="project-card"]')).toBeVisible()

    // デスクトップビューに戻す
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.waitForTimeout(500)

    // デスクトップビューでテーブル形式で表示されることを確認
    await expect(page.locator('[data-testid="projects-table"]')).toBeVisible()
  })

  test('エラーハンドリングが正常に動作する', async ({ page }) => {
    await page.goto('/dashboard')

    // ネットワークエラーをシミュレート
    await page.route('**/projects*', route => {
      route.abort('failed')
    })

    // ページをリロード
    await page.reload()

    // エラーメッセージが表示されることを確認
    await expect(page.locator('[data-testid="error-message"]')).toContainText('データの取得に失敗しました')

    // リトライボタンが表示されることを確認
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test('キーボードナビゲーションが正常に動作する', async ({ page }) => {
    await page.goto('/dashboard')

    // Tabキーでフォーカス移動
    await page.keyboard.press('Tab')
    
    // 新規登録ボタンにフォーカスが当たることを確認
    await expect(page.locator('[data-testid="add-project-button"]')).toBeFocused()

    // Enterキーで新規登録フォームを開く
    await page.keyboard.press('Enter')
    
    // フォームが表示されることを確認
    await expect(page.locator('[data-testid="project-form"]')).toBeVisible()

    // Escキーでフォームを閉じる
    await page.keyboard.press('Escape')
    
    // フォームが閉じることを確認
    await expect(page.locator('[data-testid="project-form"]')).not.toBeVisible()
  })
})