import { useState, useEffect } from 'react'
import { useAuthContext } from './auth/AuthProvider'
import { supabase } from '../lib/supabase'
import ProjectList from './projects/ProjectList'
import ProjectForm from './projects/ProjectForm'
import ProjectDetail from './projects/ProjectDetail'
import ConfirmDialog from './common/ConfirmDialog'
import { useProjects } from '../hooks/useProjects'
import type { Project, ProjectFormData } from '../types'

type ViewMode = 'dashboard' | 'list' | 'form' | 'edit' | 'detail'

export default function ConstructionProjectApp() {
  const { user } = useAuthContext()
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    project: Project | null
    loading: boolean
  }>({
    isOpen: false,
    project: null,
    loading: false
  })
  
  const { createProject, updateProject, deleteProject } = useProjects()

  // Supabase接続テスト
  useEffect(() => {
    const runConnectionTest = async () => {
      try {
        setConnectionStatus('testing')
        
        // 詳細な接続テスト
        const { testSupabaseConnection } = await import('../utils/supabaseTest')
        const result = await testSupabaseConnection()

        if (result.success) {
          console.log('✅ Supabase接続テスト成功:', result.message)
          console.log('📊 詳細:', result.details)
          setIsSupabaseConnected(true)
          setConnectionStatus('success')
        } else {
          console.error('❌ Supabase接続テスト失敗:', result.message)
          console.error('📊 詳細:', result.details)
          setIsSupabaseConnected(false)
          setConnectionStatus('error')
        }
      } catch (err) {
        console.error('Connection test failed:', err)
        setIsSupabaseConnected(false)
        setConnectionStatus('error')
      }
    }

    runConnectionTest()
  }, [])

  // 新規工事登録
  const handleCreateProject = async (data: ProjectFormData) => {
    const result = await createProject(data)
    if (!result.error) {
      setViewMode('list')
    }
    return result
  }

  // 工事更新
  const handleUpdateProject = async (data: ProjectFormData) => {
    if (!editingProject) return { error: '編集対象の工事が見つかりません' }
    
    const result = await updateProject(editingProject.id, data)
    if (!result.error) {
      setEditingProject(null)
      setViewMode('list')
    }
    return result
  }

  // 工事削除確認ダイアログを開く
  const handleDeleteProject = (project: Project) => {
    setDeleteConfirm({
      isOpen: true,
      project,
      loading: false
    })
  }

  // 工事削除実行
  const executeDeleteProject = async () => {
    if (!deleteConfirm.project) return

    setDeleteConfirm(prev => ({ ...prev, loading: true }))

    try {
      const result = await deleteProject(deleteConfirm.project.id)
      if (!result.error) {
        console.log('工事削除成功:', deleteConfirm.project.name)
        // 詳細表示中の場合は一覧に戻る
        if (viewMode === 'detail' && selectedProject?.id === deleteConfirm.project.id) {
          setSelectedProject(null)
          setViewMode('list')
        }
      } else {
        alert(`削除に失敗しました: ${result.error}`)
      }
    } catch (error) {
      alert('削除処理中にエラーが発生しました')
    } finally {
      setDeleteConfirm({
        isOpen: false,
        project: null,
        loading: false
      })
    }
  }

  // 削除確認ダイアログを閉じる
  const cancelDeleteProject = () => {
    setDeleteConfirm({
      isOpen: false,
      project: null,
      loading: false
    })
  }

  return (
    <div>
      {/* メインコンテンツ */}
      <div>
        {/* ナビゲーションボタン */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📊 ダッシュボード
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            🏗️ 工事一覧
          </button>
          <button
            onClick={() => setViewMode('form')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'form'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            ➕ 新規登録
          </button>
        </div>

        {/* ダッシュボード表示 */}
        {viewMode === 'dashboard' && (
          <>
            {/* ウェルカムメッセージ */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ようこそ、{user?.email}さん
                </h2>
                <p className="text-gray-600">
                  仕掛工事管理システムにログインしました。
                </p>
              </div>
            </div>
            
            {/* 接続状況カード */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  システム状況
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">⚙️</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-900">
                          フロントエンド
                        </p>
                        <p className="text-sm text-blue-700">
                          React + TypeScript
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    connectionStatus === 'success' ? 'bg-green-50' : 
                    connectionStatus === 'error' ? 'bg-red-50' : 'bg-yellow-50'
                  }`}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">🗄️</span>
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${
                          connectionStatus === 'success' ? 'text-green-900' : 
                          connectionStatus === 'error' ? 'text-red-900' : 'text-yellow-900'
                        }`}>
                          データベース
                        </p>
                        <p className={`text-sm ${
                          connectionStatus === 'success' ? 'text-green-700' : 
                          connectionStatus === 'error' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {connectionStatus === 'success' ? 'Supabase接続済み' : 
                           connectionStatus === 'error' ? 'Supabase接続エラー' : 'Supabase接続テスト中...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">🔐</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-900">
                          認証
                        </p>
                        <p className="text-sm text-green-700">
                          ログイン済み
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 工事一覧表示 */}
        {viewMode === 'list' && (
          <ProjectList
            onProjectSelect={(project) => {
              setSelectedProject(project)
              setViewMode('detail')
            }}
            onProjectEdit={(project) => {
              setEditingProject(project)
              setViewMode('edit')
            }}
            onProjectDelete={handleDeleteProject}
          />
        )}

        {/* 工事詳細表示 */}
        {viewMode === 'detail' && selectedProject && (
          <ProjectDetail
            project={selectedProject}
            onEdit={() => {
              setEditingProject(selectedProject)
              setViewMode('edit')
            }}
            onDelete={() => handleDeleteProject(selectedProject)}
            onClose={() => {
              setSelectedProject(null)
              setViewMode('list')
            }}
          />
        )}

        {/* 新規登録フォーム */}
        {viewMode === 'form' && (
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setViewMode('list')}
          />
        )}

        {/* 編集フォーム */}
        {viewMode === 'edit' && editingProject && (
          <ProjectForm
            project={editingProject}
            onSubmit={handleUpdateProject}
            onCancel={() => {
              setEditingProject(null)
              setViewMode('list')
            }}
          />
        )}

        {/* 削除確認ダイアログ */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          title="工事データの削除"
          message={`工事「${deleteConfirm.project?.name}」を削除しますか？この操作は取り消せません。`}
          confirmText="削除"
          cancelText="キャンセル"
          onConfirm={executeDeleteProject}
          onCancel={cancelDeleteProject}
          loading={deleteConfirm.loading}
          type="danger"
        />
      </div>
    </div>
  )
}