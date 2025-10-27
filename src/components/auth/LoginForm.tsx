import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../../schemas/validation'
import { useAuthContext } from './AuthProvider'
import type { LoginFormData } from '../../types'

interface LoginFormProps {
  onSuccess?: () => void
  showSignUp?: boolean
  onToggleMode?: () => void
}

export default function LoginForm({ 
  onSuccess, 
  showSignUp = false,
  onToggleMode 
}: LoginFormProps) {
  const { signIn, signUp, loading, error, clearError } = useAuthContext()
  const [isSignUpMode, setIsSignUpMode] = useState(showSignUp)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    clearError()
    
    try {
      const { error } = isSignUpMode 
        ? await signUp(data)
        : await signIn(data)

      if (!error) {
        reset()
        onSuccess?.()
      }
    } catch (err) {
      console.error('Authentication error:', err)
    }
  }

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode)
    clearError()
    reset()
    onToggleMode?.()
  }

  const isLoading = loading || isSubmitting

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🏗️</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUpMode ? 'アカウント作成' : 'ログイン'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            仕掛工事管理システム
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {isSignUpMode ? 'アカウント作成エラー' : 'ログインエラー'}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    type="button"
                    onClick={clearError}
                    className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
                  >
                    <span className="sr-only">閉じる</span>
                    <span className="text-sm">×</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="your-email@example.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="パスワード"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <span className="text-gray-400 text-sm">
                    {showPassword ? '🙈' : '👁️'}
                  </span>
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading && (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </span>
              )}
              {isSignUpMode ? 'アカウント作成' : 'ログイン'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400"
            >
              {isSignUpMode 
                ? 'すでにアカウントをお持ちですか？ログイン' 
                : 'アカウントをお持ちでない方はこちら'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}