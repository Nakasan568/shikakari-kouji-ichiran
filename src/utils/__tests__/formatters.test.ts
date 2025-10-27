import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateShort,
  formatDateTime,
  formatRelativeTime,
  formatPercentage,
  formatDuration,
  calculateBudgetRatio,
  getStatusColor
} from '../formatters'

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('正の数値を日本円形式でフォーマットする', () => {
      expect(formatCurrency(1000000)).toBe('¥1,000,000')
      expect(formatCurrency(50000000)).toBe('¥50,000,000')
    })

    it('0を正しくフォーマットする', () => {
      expect(formatCurrency(0)).toBe('¥0')
    })

    it('小数点以下を切り捨てる', () => {
      expect(formatCurrency(1000000.99)).toBe('¥1,000,001')
    })
  })

  describe('formatNumber', () => {
    it('数値をカンマ区切りでフォーマットする', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('formatDate', () => {
    it('日付文字列を日本語形式でフォーマットする', () => {
      const result = formatDate('2024-01-15')
      expect(result).toMatch(/2024年1月15日/)
    })

    it('空文字列や undefined の場合は "-" を返す', () => {
      expect(formatDate('')).toBe('-')
      expect(formatDate(undefined)).toBe('-')
    })

    it('無効な日付の場合はエラーを投げない', () => {
      expect(() => formatDate('invalid-date')).not.toThrow()
    })
  })

  describe('formatDateShort', () => {
    it('日付文字列を短縮形式でフォーマットする', () => {
      const result = formatDateShort('2024-01-15')
      expect(result).toMatch(/2024年1月15日/)
    })

    it('空文字列の場合は "-" を返す', () => {
      expect(formatDateShort('')).toBe('-')
    })
  })

  describe('formatDateTime', () => {
    it('日時文字列を日本語形式でフォーマットする', () => {
      const result = formatDateTime('2024-01-15T10:30:00Z')
      expect(result).toMatch(/2024年1月15日/)
      expect(result).toMatch(/\d{2}:\d{2}/)
    })
  })

  describe('formatRelativeTime', () => {
    it('現在時刻に近い時間を相対時間でフォーマットする', () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      
      const result = formatRelativeTime(oneHourAgo.toISOString())
      expect(result).toBe('1時間前')
    })

    it('1分未満の場合は "たった今" を返す', () => {
      const now = new Date()
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)
      
      const result = formatRelativeTime(thirtySecondsAgo.toISOString())
      expect(result).toBe('たった今')
    })

    it('日単位の相対時間を正しく計算する', () => {
      const now = new Date()
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      
      const result = formatRelativeTime(threeDaysAgo.toISOString())
      expect(result).toBe('3日前')
    })
  })

  describe('formatPercentage', () => {
    it('数値をパーセンテージ形式でフォーマットする', () => {
      expect(formatPercentage(50)).toBe('50.0%')
      expect(formatPercentage(33.333)).toBe('33.3%')
      expect(formatPercentage(100, 0)).toBe('100%')
    })
  })

  describe('formatDuration', () => {
    it('開始日と終了日から工期を計算する', () => {
      expect(formatDuration('2024-01-01', '2024-01-31')).toBe('31日間')
      expect(formatDuration('2024-01-01', '2024-01-08')).toBe('1週間1日')
      expect(formatDuration('2024-01-01', '2024-02-01')).toBe('1ヶ月1日')
    })

    it('同日の場合は "当日" を返す', () => {
      expect(formatDuration('2024-01-01', '2024-01-01')).toBe('当日')
    })

    it('開始日または終了日が未定義の場合は "-" を返す', () => {
      expect(formatDuration(undefined, '2024-01-31')).toBe('-')
      expect(formatDuration('2024-01-01', undefined)).toBe('-')
      expect(formatDuration(undefined, undefined)).toBe('-')
    })

    it('1年以上の工期を正しく計算する', () => {
      expect(formatDuration('2024-01-01', '2025-01-01')).toBe('1年1日')
    })
  })

  describe('calculateBudgetRatio', () => {
    it('実行予算と契約金額から比率を計算する', () => {
      expect(calculateBudgetRatio(9000000, 10000000)).toBe(90)
      expect(calculateBudgetRatio(11000000, 10000000)).toBe(110)
      expect(calculateBudgetRatio(5000000, 10000000)).toBe(50)
    })

    it('契約金額が0の場合は0を返す', () => {
      expect(calculateBudgetRatio(5000000, 0)).toBe(0)
    })

    it('実行予算が0の場合は0を返す', () => {
      expect(calculateBudgetRatio(0, 10000000)).toBe(0)
    })
  })

  describe('getStatusColor', () => {
    it('計画中ステータスの色を返す', () => {
      const colors = getStatusColor('計画中')
      expect(colors.bg).toBe('bg-blue-50')
      expect(colors.text).toBe('text-blue-800')
      expect(colors.border).toBe('border-blue-200')
    })

    it('仕掛中ステータスの色を返す', () => {
      const colors = getStatusColor('仕掛中')
      expect(colors.bg).toBe('bg-yellow-50')
      expect(colors.text).toBe('text-yellow-800')
      expect(colors.border).toBe('border-yellow-200')
    })

    it('完工済ステータスの色を返す', () => {
      const colors = getStatusColor('完工済')
      expect(colors.bg).toBe('bg-green-50')
      expect(colors.text).toBe('text-green-800')
      expect(colors.border).toBe('border-green-200')
    })

    it('不明なステータスの場合はデフォルト色を返す', () => {
      const colors = getStatusColor('不明')
      expect(colors.bg).toBe('bg-gray-50')
      expect(colors.text).toBe('text-gray-800')
      expect(colors.border).toBe('border-gray-200')
    })
  })
})