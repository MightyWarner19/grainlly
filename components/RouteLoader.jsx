'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import LoadingSpinner from '@/components/Loading'

const RouteLoader = ({ children }) => {
  const pathname = usePathname()
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setShowLoader(false), 1000)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!pathname) return
    setShowLoader(true)
    const timeout = setTimeout(() => setShowLoader(false), 1000)
    return () => clearTimeout(timeout)
  }, [pathname])

  return (
    <>
      {showLoader && (
        <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      {children}
    </>
  )
}

export default RouteLoader
