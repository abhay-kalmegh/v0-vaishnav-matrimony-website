'use client'

import { BottomNavigation } from './bottom-navigation'

interface MobileLayoutProps {
  children: React.ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <>
      {children}
      <BottomNavigation />
      {/* Safe area spacer for bottom navigation */}
      <div className="h-20 md:hidden" />
    </>
  )
}
