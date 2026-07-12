'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Heart, User } from 'lucide-react'

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
}

const navItems: NavItem[] = [
  {
    icon: <Home className="h-6 w-6" />,
    label: 'Home',
    href: '/dashboard',
  },
  {
    icon: <Search className="h-6 w-6" />,
    label: 'Search',
    href: '/search',
  },
  {
    icon: <Heart className="h-6 w-6" />,
    label: 'Interests',
    href: '/interests',
  },
  {
    icon: <User className="h-6 w-6" />,
    label: 'Profile',
    href: '/profile/edit',
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/dashboard' && pathname === '/') ||
            pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-2 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={item.label}
              title={item.label}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
