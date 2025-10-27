import React, { useState } from 'react'
import { useAuthContext } from '../auth/AuthProvider'

interface HeaderProps {
  onMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

export default function Header({ onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const { user, signOut, loading } = useAuthContext()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    if (window.confirm('ログアウトしますか？')) {
      await signOut()
    }
    setShowUserMenu(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側: ロゴとハンバーガーメニュー */}
          <div className="flex items-center space-x-4">
            {/* モバイル用ハンバーガーメニューボタン */}
            <button
              onClick={onMenuToggle}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">メニューを開く</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* ロゴ */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏗️</span>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  仕掛工事管理システム
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Construction Project Management
                </p>
              </div>
            </div>
          </div>

          {/* 中央: デスクトップ用ナビゲーション */}
          <nav className="hidden md:flex space-x-8">
            <NavLink href="#dashboard" active>
              📊 ダッシュボード
            </NavLink>
            <NavLink href="#projects">
              🏗️ 工事一覧
            </NavLink>
            <NavLink href="#new-project">
              ➕ 新規登録
            </NavLink>
            <NavLink href="#reports">
              📈 レポート
            </NavLink>
          </nav>

          {/* 右側: ユーザーメニュー */}
          <div className="flex items-center space-x-4">
            {/* 通知アイコン */}
            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
              <span className="sr-only">通知</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z" />
              </svg>
            </button>

            {/* ユーザーメニュー */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500">管理者</p>
                </div>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* ユーザードロップダウンメニュー */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500">ログイン中</p>
                  </div>
                  
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    👤 プロフィール
                  </button>
                  
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ⚙️ 設定
                  </button>
                  
                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        loading 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-red-700 hover:bg-red-50'
                      }`}
                    >
                      {loading ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⏳</span>
                          ログアウト中...
                        </>
                      ) : (
                        <>🚪 ログアウト</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* モバイル用ナビゲーションメニュー */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <MobileNavLink href="#dashboard" active>
              📊 ダッシュボード
            </MobileNavLink>
            <MobileNavLink href="#projects">
              🏗️ 工事一覧
            </MobileNavLink>
            <MobileNavLink href="#new-project">
              ➕ 新規登録
            </MobileNavLink>
            <MobileNavLink href="#reports">
              📈 レポート
            </MobileNavLink>
          </div>
        </div>
      )}
    </header>
  )
}

// デスクトップ用ナビゲーションリンク
interface NavLinkProps {
  href: string
  children: React.ReactNode
  active?: boolean
}

function NavLink({ href, children, active = false }: NavLinkProps) {
  return (
    <a
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </a>
  )
}

// モバイル用ナビゲーションリンク
function MobileNavLink({ href, children, active = false }: NavLinkProps) {
  return (
    <a
      href={href}
      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
        active
          ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </a>
  )
}