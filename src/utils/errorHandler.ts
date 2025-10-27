// グローバルエラーハンドリングユーティリティ

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
  userMessage: string
}

export class CustomError extends Error {
  code: string
  userMessage: string
  details?: any

  constructor(code: string, message: string, userMessage: string, details?: any) {
    super(message)
    this.name = 'CustomError'
    this.code = code
    this.userMessage = userMessage
    this.details = details
  }
}

// エラーコードとユーザー向けメッセージのマッピング
const ERROR_MESSAGES: Record<string, string> = {
  // 認証関連
  'auth/invalid-email': 'メールアドレスの形式が正しくありません',
  'auth/user-disabled': 'このアカウントは無効化されています',
  'auth/user-not-found': 'ユーザーが見つかりません',
  'auth/wrong-password': 'パスワードが間違っています',
  'auth/too-many-requests': 'ログイン試行回数が上限に達しました。しばらく時間をおいてから再試行してください',
  'auth/network-request-failed': 'ネットワークエラーが発生しました',
  'auth/invalid-credential': 'ログイン情報が正しくありません',

  // データベース関連
  'db/connection-failed': 'データベースへの接続に失敗しました',
  'db/query-failed': 'データの取得に失敗しました',
  'db/insert-failed': 'データの登録に失敗しました',
  'db/update-failed': 'データの更新に失敗しました',
  'db/delete-failed': 'データの削除に失敗しました',
  'db/constraint-violation': 'データの整合性エラーが発生しました',
  'db/duplicate-entry': '既に存在するデータです',

  // バリデーション関連
  'validation/required-field': '必須項目が入力されていません',
  'validation/invalid-format': '入力形式が正しくありません',
  'validation/out-of-range': '入力値が範囲外です',
  'validation/invalid-date': '日付の形式が正しくありません',

  // ネットワーク関連
  'network/timeout': '通信がタイムアウトしました',
  'network/offline': 'インターネット接続を確認してください',
  'network/server-error': 'サーバーエラーが発生しました',

  // ファイル関連
  'file/upload-failed': 'ファイルのアップロードに失敗しました',
  'file/invalid-type': 'サポートされていないファイル形式です',
  'file/too-large': 'ファイルサイズが大きすぎます',

  // 権限関連
  'permission/access-denied': 'この操作を実行する権限がありません',
  'permission/resource-not-found': 'リソースが見つかりません',

  // 一般的なエラー
  'general/unknown': '予期しないエラーが発生しました',
  'general/maintenance': 'システムメンテナンス中です'
}

/**
 * エラーを解析してユーザーフレンドリーなメッセージを生成
 */
export function parseError(error: any): AppError {
  const timestamp = new Date()
  
  // CustomErrorの場合
  if (error instanceof CustomError) {
    return {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      details: error.details,
      timestamp
    }
  }

  // Supabaseエラーの場合
  if (error?.code) {
    const userMessage = ERROR_MESSAGES[error.code] || ERROR_MESSAGES['general/unknown']
    return {
      code: error.code,
      message: error.message || 'Unknown error',
      userMessage,
      details: error.details,
      timestamp
    }
  }

  // 一般的なErrorオブジェクトの場合
  if (error instanceof Error) {
    // 特定のエラーメッセージパターンをチェック
    let code = 'general/unknown'
    let userMessage = ERROR_MESSAGES['general/unknown']

    if (error.message.includes('network') || error.message.includes('fetch')) {
      code = 'network/server-error'
      userMessage = ERROR_MESSAGES['network/server-error']
    } else if (error.message.includes('timeout')) {
      code = 'network/timeout'
      userMessage = ERROR_MESSAGES['network/timeout']
    } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      code = 'permission/access-denied'
      userMessage = ERROR_MESSAGES['permission/access-denied']
    }

    return {
      code,
      message: error.message,
      userMessage,
      timestamp
    }
  }

  // 文字列エラーの場合
  if (typeof error === 'string') {
    return {
      code: 'general/unknown',
      message: error,
      userMessage: ERROR_MESSAGES['general/unknown'],
      timestamp
    }
  }

  // その他の場合
  return {
    code: 'general/unknown',
    message: 'Unknown error occurred',
    userMessage: ERROR_MESSAGES['general/unknown'],
    details: error,
    timestamp
  }
}

/**
 * エラーをログに記録
 */
export function logError(error: AppError, context?: string) {
  const logData = {
    ...error,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href
  }

  // 開発環境ではコンソールに出力
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error: ${error.code}`)
    console.error('Message:', error.message)
    console.error('User Message:', error.userMessage)
    console.error('Details:', error.details)
    console.error('Context:', context)
    console.error('Timestamp:', error.timestamp)
    console.groupEnd()
  }

  // 本番環境では外部ログサービスに送信
  // TODO: 実際のログサービス（Sentry、LogRocket等）との統合
}

/**
 * 非同期操作のエラーハンドリングラッパー
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (err) {
    const error = parseError(err)
    logError(error, context)
    return { data: null, error }
  }
}

/**
 * リトライ機能付きの非同期操作
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: string
): Promise<{ data: T | null; error: AppError | null }> {
  let lastError: AppError | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await withErrorHandling(operation, `${context} (attempt ${attempt}/${maxRetries})`)
    
    if (result.error === null) {
      return result
    }

    lastError = result.error

    // 最後の試行でない場合は待機
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  return { data: null, error: lastError }
}

/**
 * ネットワーク状態をチェック
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * エラーの重要度を判定
 */
export function getErrorSeverity(error: AppError): 'low' | 'medium' | 'high' | 'critical' {
  if (error.code.startsWith('auth/')) {
    return 'high'
  }
  if (error.code.startsWith('db/')) {
    return 'high'
  }
  if (error.code.startsWith('network/')) {
    return 'medium'
  }
  if (error.code.startsWith('validation/')) {
    return 'low'
  }
  if (error.code.startsWith('permission/')) {
    return 'high'
  }
  return 'medium'
}