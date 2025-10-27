// パフォーマンス監視ユーティリティ

/**
 * パフォーマンスメトリクスを取得
 */
export const getPerformanceMetrics = () => {
  if (typeof window === 'undefined' || !window.performance) {
    return null
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const paint = performance.getEntriesByType('paint')

  return {
    // ページ読み込み時間
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    
    // DOM構築時間
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    
    // 最初の描画時間
    firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
    
    // 最初のコンテンツ描画時間
    firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    
    // DNS解決時間
    dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
    
    // TCP接続時間
    tcpTime: navigation.connectEnd - navigation.connectStart,
    
    // サーバー応答時間
    responseTime: navigation.responseEnd - navigation.requestStart,
    
    // リソース読み込み時間
    resourceTime: navigation.loadEventEnd - navigation.responseEnd
  }
}

/**
 * Core Web Vitalsを測定
 */
export const measureCoreWebVitals = () => {
  if (typeof window === 'undefined') return

  // Largest Contentful Paint (LCP)
  const observeLCP = () => {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })
  }

  // First Input Delay (FID)
  const observeFID = () => {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        console.log('FID:', entry.processingStart - entry.startTime)
      })
    }).observe({ entryTypes: ['first-input'] })
  }

  // Cumulative Layout Shift (CLS)
  const observeCLS = () => {
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      console.log('CLS:', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // 各メトリクスの監視を開始
  if ('PerformanceObserver' in window) {
    observeLCP()
    observeFID()
    observeCLS()
  }
}

/**
 * メモリ使用量を監視
 */
export const getMemoryUsage = () => {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return null
  }

  const memory = (performance as any).memory
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
  }
}

/**
 * パフォーマンス警告を表示
 */
export const checkPerformanceWarnings = () => {
  const metrics = getPerformanceMetrics()
  const memory = getMemoryUsage()

  if (!metrics) return

  const warnings: string[] = []

  // 読み込み時間の警告
  if (metrics.loadTime > 3000) {
    warnings.push(`ページ読み込み時間が遅いです: ${metrics.loadTime}ms`)
  }

  // First Contentful Paintの警告
  if (metrics.firstContentfulPaint > 2500) {
    warnings.push(`初回コンテンツ描画が遅いです: ${metrics.firstContentfulPaint}ms`)
  }

  // メモリ使用量の警告
  if (memory && memory.usagePercentage > 80) {
    warnings.push(`メモリ使用量が高いです: ${memory.usagePercentage.toFixed(1)}%`)
  }

  if (warnings.length > 0 && import.meta.env.DEV) {
    console.warn('パフォーマンス警告:', warnings)
  }

  return warnings
}

/**
 * デバウンス関数（パフォーマンス最適化用）
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * スロットル関数（パフォーマンス最適化用）
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}