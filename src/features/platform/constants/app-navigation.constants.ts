import {
  HomeIcon,
  ListIcon,
  SettingsIcon,
} from '@/features/platform/components/app-navigation-icons'
import { APP_ROUTES } from '@/features/platform/constants/app-routes.constants'
import type { NavigationDestination } from '@/features/platform/types/navigation.type'

export const APP_NAVIGATION: NavigationDestination[] = [
  { label: 'Início', href: APP_ROUTES.home, icon: HomeIcon },
  { label: 'Lançamentos', href: APP_ROUTES.transactions, icon: ListIcon },
  { label: 'Ajustes', href: APP_ROUTES.settings, icon: SettingsIcon },
]
