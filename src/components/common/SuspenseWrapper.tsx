import React, { Suspense } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface SuspenseWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({ 
  children, 
  fallback = <LoadingSpinner /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

export default SuspenseWrapper