'use client'

import { usePathname } from 'next/navigation'

import { AppNavigationItem } from '@/features/platform/components/app-navigation-item'
import { APP_NAVIGATION } from '@/features/platform/constants/app-navigation.constants'
import { APP_ROUTES } from '@/features/platform/constants/app-routes.constants'

export function AppBottomNavigation() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === APP_ROUTES.home ? pathname === href : pathname.startsWith(href)

  return (
    <nav className="border-line bg-surf shrink-0 border-t">
      <div className="max-w-app md:max-w-app-wide safe-bottom mx-auto grid w-full grid-cols-4 gap-0.5 px-3 pt-2.5">
        {APP_NAVIGATION.map((destination) => (
          <AppNavigationItem
            key={destination.href}
            destination={destination}
            active={isActive(destination.href)}
          />
        ))}
      </div>
    </nav>
  )
}
