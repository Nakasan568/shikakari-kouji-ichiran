import { supabase } from '../lib/supabase'

export interface ConnectionTestResult {
  success: boolean
  message: string
  details?: any
}

// Supabase接続テスト
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  try {
    console.log('🔄 Supabase接続テスト開始...')
    
    // 1. 基本的な接続テスト
    const { data: healthCheck, error: healthError } = await supabase
      .from('employees')
      .select('count')
      .limit(1)

    if (healthError) {
      return {
        success: false,
        message: `データベース接続エラー: ${healthError.message}`,
        details: healthError
      }
    }

    console.log('✅ データベース接続成功')

    // 2. テーブル存在確認
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .limit(5)

    if (employeesError) {
      return {
        success: false,
        message: `employeesテーブルアクセスエラー: ${employeesError.message}`,
        details: employeesError
      }
    }

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(5)

    if (projectsError) {
      return {
        success: false,
        message: `projectsテーブルアクセスエラー: ${projectsError.message}`,
        details: projectsError
      }
    }

    console.log(`✅ employeesテーブル: ${employees?.length || 0}件`)
    console.log(`✅ projectsテーブル: ${projects?.length || 0}件`)

    // 3. 認証テスト
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError && authError.message !== 'Invalid JWT') {
      console.warn('⚠️ 認証テスト:', authError.message)
    } else {
      console.log('✅ 認証システム動作確認')
    }

    return {
      success: true,
      message: 'Supabase接続テスト完了',
      details: {
        employeesCount: employees?.length || 0,
        projectsCount: projects?.length || 0,
        authStatus: user ? 'ログイン済み' : '未ログイン'
      }
    }

  } catch (error) {
    console.error('❌ Supabase接続テストエラー:', error)
    return {
      success: false,
      message: `接続テスト失敗: ${error instanceof Error ? error.message : '不明なエラー'}`,
      details: error
    }
  }
}

// データベーステーブルの構造確認
export async function checkDatabaseSchema(): Promise<ConnectionTestResult> {
  try {
    console.log('🔍 データベーススキーマ確認開始...')

    // employeesテーブルの構造確認
    const { data: employeeSample, error: empError } = await supabase
      .from('employees')
      .select('*')
      .limit(1)

    if (empError) {
      return {
        success: false,
        message: `employeesテーブル確認エラー: ${empError.message}`,
        details: empError
      }
    }

    // projectsテーブルの構造確認
    const { data: projectSample, error: projError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)

    if (projError) {
      return {
        success: false,
        message: `projectsテーブル確認エラー: ${projError.message}`,
        details: projError
      }
    }

    console.log('✅ データベーススキーマ確認完了')

    return {
      success: true,
      message: 'データベーススキーマ確認完了',
      details: {
        employeesSchema: employeeSample?.[0] ? Object.keys(employeeSample[0]) : [],
        projectsSchema: projectSample?.[0] ? Object.keys(projectSample[0]) : []
      }
    }

  } catch (error) {
    console.error('❌ スキーマ確認エラー:', error)
    return {
      success: false,
      message: `スキーマ確認失敗: ${error instanceof Error ? error.message : '不明なエラー'}`,
      details: error
    }
  }
}