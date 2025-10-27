import React, { useState, useEffect } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 画面サイズの監視
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      // デスクトップでは自動的にサイドバーを閉じる
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <Header 
        onMenuToggle={toggleSidebar}
        isMobileMenuOpen={isSidebarOpen}
      />

      <div className="flex">
        {/* サイドバー（デスクトップ用） */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <Sidebar isOpen={true} onClose={closeSidebar} />
          </div>
        </div>

        {/* モバイル用サイドバー */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* メインコンテンツエリア */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>

          {/* フッター */}
          <footer className="bg-white border-t border-gray-200 px-4 py-4 sm:px-6 md:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>© 2024 仕掛工事管理システム</span>
                <span className="hidden sm:inline">|</span>
                <span className="hidden sm:inline">バージョン 1.0.0</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <a href="#help" className="hover:text-gray-700">
                  ヘルプ
                </a>
                <span>|</span>
                <a href="#support" className="hover:text-gray-700">
                  サポート
                </a>
                <span>|</span>
                <a href="#privacy" className="hover:text-gray-700">
                  プライバシー
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}