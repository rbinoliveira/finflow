import type { ComponentType, SVGProps } from 'react'

export type NavigationDestination = {
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}
