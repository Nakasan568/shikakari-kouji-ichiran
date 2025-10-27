import React from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavigationItem {
  id: string
  name: string
  icon: string
  href: string
  active?: boolean
  badge?: string | number
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'ダッシュボード',
    icon: '📊',
    href: '#dashboard',
    active: true
  },
  {
    id: 'projects',
    name: '工事一覧',
    icon: '🏗️',
    href: '#projects',
    badge: '12'
  },
  {
    id: 'new-project',
    name: '新規工事登録',
    icon: '➕',
    href: '#new-project'
  },
  {
    id: 'employees',
    name: '担当者管理',
    icon: '👥',
    href: '#employees'
  },
  {
    id: 'reports',
    name: 'レポート',
    icon: '📈',
    href: '#reports'
  },
  {
    id: 'search',
    name: '検索・フィルター',
    icon: '🔍',
    href: '#search'
  }
]

const quickActions: NavigationItem[] = [
  {
    id: 'quick-add',
    name: '工事を追加',
    icon: '⚡',
    href: '#quick-add'
  },
  {
    id: 'export',
    name: 'データエクスポート',
    icon: '📤',
    href: '#export'
  },
  {
    id: 'settings',
    name: '設定',
    icon: '⚙️',
    href: '#settings'
  }
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* オーバーレイ（モバイル用） */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドバー */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* サイドバーヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏗️</span>
              <span className="font-semibold text-gray-900">メニュー</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* メインナビゲーション */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                メイン機能
              </h3>
              {navigationItems.map((item) => (
                <SidebarLink key={item.id} item={item} onClick={onClose} />
              ))}
            </div>

            <div className="pt-6 space-y-1">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                クイックアクション
              </h3>
              {quickActions.map((item) => (
                <SidebarLink key={item.id} item={item} onClick={onClose} />
              ))}
            </div>
          </nav>

          {/* サイドバーフッター */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center">
                <span className="text-lg mr-2">💡</span>
                <div>
                  <p className="text-sm font-medium text-blue-900">ヒント</p>
                  <p className="text-xs text-blue-700">
                    工事の進捗は定期的に更新しましょう
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// サイドバーリンクコンポーネント
interface SidebarLinkProps {
  item: NavigationItem
  onClick: () => void
}

function SidebarLink({ item, onClick }: SidebarLinkProps) {
  return (
    <a
      href={item.href}
      onClick={onClick}
      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        item.active
          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="mr-3 text-lg">{item.icon}</span>
      <span className="flex-1">{item.name}</span>
      {item.badge && (
        <span
          className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            item.active
              ? 'bg-blue-200 text-blue-800'
              : 'bg-gray-200 text-gray-800 group-hover:bg-gray-300'
          }`}
        >
          {item.badge}
        </span>
      )}
    </a>
  )
}