import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'gray' | 'green' | 'red' | 'yellow'
  text?: string
  fullScreen?: boolean
  overlay?: boolean
}

export default function LoadingSpinner({
  size = 'md',
  color = 'blue',
  text,
  fullScreen = false,
  overlay = false
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'md':
        return 'h-8 w-8'
      case 'lg':
        return 'h-12 w-12'
      case 'xl':
        return 'h-16 w-16'
      default:
        return 'h-8 w-8'
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'border-blue-600'
      case 'gray':
        return 'border-gray-600'
      case 'green':
        return 'border-green-600'
      case 'red':
        return 'border-red-600'
      case 'yellow':
        return 'border-yellow-600'
      default:
        return 'border-blue-600'
    }
  }

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'md':
        return 'text-base'
      case 'lg':
        return 'text-lg'
      case 'xl':
        return 'text-xl'
      default:
        return 'text-base'
    }
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`animate-spin rounded-full border-b-2 ${getSizeClasses()} ${getColorClasses()}`}
      />
      {text && (
        <p className={`text-gray-600 ${getTextSizeClasses()}`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${
        overlay ? 'bg-white bg-opacity-75' : 'bg-gray-50'
      }`}>
        {spinner}
      </div>
    )
  }

  return spinner
}

// 特定用途向けのプリセットコンポーネント
export function PageLoadingSpinner({ text = 'ページを読み込み中...' }: { text?: string }) {
  return (
    <LoadingSpinner
      size="lg"
      color="blue"
      text={text}
      fullScreen
      overlay
    />
  )
}

export function ButtonLoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <LoadingSpinner
      size={size}
      color="gray"
    />
  )
}

export function TableLoadingSpinner({ text = 'データを読み込み中...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner
        size="md"
        color="blue"
        text={text}
      />
    </div>
  )
}

export function InlineLoadingSpinner({ size = 'sm', color = 'blue' }: { 
  size?: 'sm' | 'md'
  color?: 'blue' | 'gray' | 'green' | 'red' | 'yellow'
}) {
  return (
    <div className="inline-flex items-center">
      <LoadingSpinner size={size} color={color} />
    </div>
  )
}