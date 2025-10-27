import { useState, useEffect, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { LoginFormData } from '../types'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

interface AuthActions {
  signIn: (credentials: LoginFormData) => Promise<{ error: AuthError | null }>
  signUp: (credentials: LoginFormData) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  clearError: () => void
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  // セッション状態の監視
  useEffect(() => {
    let mounted = true

    // 初期セッションの取得
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (mounted) {
          if (error) {
            setState(prev => ({
              ...prev,
              loading: false,
              error: error.message
            }))
          } else {
            setState(prev => ({
              ...prev,
              session,
              user: session?.user ?? null,
              loading: false,
              error: null
            }))
          }
        }
      } catch (err) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : '認証エラーが発生しました'
          }))
        }
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (mounted) {
          setState(prev => ({
            ...prev,
            session,
            user: session?.user ?? null,
            loading: false,
            error: null
          }))
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // ログイン
  const signIn = useCallback(async (credentials: LoginFormData) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
      }

      return { error }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return { error: { message: errorMessage } as AuthError }
    }
  }, [])

  // サインアップ
  const signUp = useCallback(async (credentials: LoginFormData) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password
      })

      if (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null
        }))
      }

      return { error }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'アカウント作成に失敗しました'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return { error: { message: errorMessage } as AuthError }
    }
  }, [])

  // ログアウト
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
      }

      return { error }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログアウトに失敗しました'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return { error: { message: errorMessage } as AuthError }
    }
  }, [])

  // パスワードリセット
  const resetPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      setState(prev => ({ ...prev, loading: false }))

      if (error) {
        setState(prev => ({
          ...prev,
          error: error.message
        }))
      }

      return { error }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'パスワードリセットに失敗しました'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return { error: { message: errorMessage } as AuthError }
    }
  }, [])

  // エラークリア
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError
  }
}