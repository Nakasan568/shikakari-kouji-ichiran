import { lazy } from 'react'

// 遅延読み込み用のコンポーネント定義
export const LazyProjectList = lazy(() => import('./projects/ProjectList'))
export const LazyProjectForm = lazy(() => import('./projects/ProjectForm'))
export const LazyProjectDetail = lazy(() => import('./projects/ProjectDetail'))
export const LazySearchFilters = lazy(() => import('./projects/SearchFilters'))
export const LazyResponsiveProjectTable = lazy(() => import('./projects/ResponsiveProjectTable'))

// 共通コンポーネントの遅延読み込み
export const LazyPagination = lazy(() => import('./common/Pagination'))
export const LazyConfirmDialog = lazy(() => import('./common/ConfirmDialog'))
export const LazyDateRangePicker = lazy(() => import('./common/DateRangePicker'))
export const LazyToastContainer = lazy(() => import('./common/ToastContainer'))

// レイアウトコンポーネントの遅延読み込み
export const LazyHeader = lazy(() => import('./layout/Header'))
export const LazySidebar = lazy(() => import('./layout/Sidebar'))
export const LazyLayout = lazy(() => import('./layout/Layout'))