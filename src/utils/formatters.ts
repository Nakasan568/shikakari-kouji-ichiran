// データフォーマット用のユーティリティ関数

/**
 * 金額をカンマ区切りの日本円形式でフォーマット
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0
  }).format(amount)
}

/**
 * 数値をカンマ区切りでフォーマット
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ja-JP').format(num)
}

/**
 * 日付を日本語形式でフォーマット
 */
export const formatDate = (dateString?: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return '-'
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  return new Date(dateString).toLocaleDateString('ja-JP', options || defaultOptions)
}

/**
 * 日付を短縮形式でフォーマット
 */
export const formatDateShort = (dateString?: string): string => {
  if (!dateString) return '-'
  
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * 日時を日本語形式でフォーマット
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 相対時間を表示（例：2時間前、3日前）
 */
export const formatRelativeTime = (dateString: string): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffMinutes < 1) return 'たった今'
  if (diffMinutes < 60) return `${diffMinutes}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`
  if (diffWeeks < 4) return `${diffWeeks}週間前`
  if (diffMonths < 12) return `${diffMonths}ヶ月前`
  return `${diffYears}年前`
}

/**
 * パーセンテージをフォーマット
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * 工期を計算してフォーマット
 */
export const formatDuration = (startDate?: string, endDate?: string): string => {
  if (!startDate || !endDate) return '-'
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '当日'
  if (diffDays < 7) return `${diffDays}日間`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    const remainingDays = diffDays % 7
    return remainingDays > 0 ? `${weeks}週間${remainingDays}日` : `${weeks}週間`
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    const remainingDays = diffDays % 30
    return remainingDays > 0 ? `${months}ヶ月${remainingDays}日` : `${months}ヶ月`
  }
  
  const years = Math.floor(diffDays / 365)
  const remainingDays = diffDays % 365
  return remainingDays > 0 ? `${years}年${remainingDays}日` : `${years}年`
}

/**
 * ファイルサイズをフォーマット
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 電話番号をフォーマット
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }
  
  return phone
}

/**
 * 郵便番号をフォーマット
 */
export const formatPostalCode = (postal: string): string => {
  const cleaned = postal.replace(/\D/g, '')
  
  if (cleaned.length === 7) {
    return cleaned.replace(/(\d{3})(\d{4})/, '$1-$2')
  }
  
  return postal
}

/**
 * テキストを指定文字数で切り詰め
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * 予算比率を計算
 */
export const calculateBudgetRatio = (executionBudget: number, contractAmount: number): number => {
  if (contractAmount === 0) return 0
  return Math.round((executionBudget / contractAmount) * 100)
}

/**
 * 進捗率を計算（仮の実装）
 */
export const calculateProgress = (status: string, startDate?: string, endDate?: string): number => {
  switch (status) {
    case '計画中':
      return 0
    case '完工済':
      return 100
    case '仕掛中':
      // 開始日と終了日から進捗を推定
      if (!startDate || !endDate) return 50
      
      const now = new Date()
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (now < start) return 0
      if (now > end) return 100
      
      const totalDuration = end.getTime() - start.getTime()
      const elapsed = now.getTime() - start.getTime()
      
      return Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100)
    default:
      return 0
  }
}

/**
 * ステータスに応じた色を取得
 */
export const getStatusColor = (status: string): {
  bg: string
  text: string
  border: string
} => {
  switch (status) {
    case '計画中':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200'
      }
    case '仕掛中':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200'
      }
    case '完工済':
      return {
        bg: 'bg-green-50',
        text: 'text-green-800',
        border: 'border-green-200'
      }
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-800',
        border: 'border-gray-200'
      }
  }
}