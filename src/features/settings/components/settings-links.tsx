'use client'

import Link from 'next/link'

import { useAccess } from '@/features/access/providers/access.provider'
import { APP_ROUTES } from '@/features/platform/constants/app-routes.constants'
import { Card } from '@/shared/components/card'

type SettingsLink = {
  href: string
  label: string
  hint: string
  emoji: string
}

const LINKS: SettingsLink[] = [
  {
    href: `${APP_ROUTES.settings}/categories`,
    label: 'Categorias',
    hint: 'Organize despesas e receitas',
    emoji: '🏷️',
  },
  {
    href: APP_ROUTES.cards,
    label: 'Cartões',
    hint: 'Limite, fechamento e vencimento',
    emoji: '💳',
  },
  {
    href: APP_ROUTES.recurrences,
    label: 'Recorrências',
    hint: 'Contas que se repetem todo mês',
    emoji: '🔁',
  },
]

const ADMIN_LINK: SettingsLink = {
  href: APP_ROUTES.access,
  label: 'Acessos',
  hint: 'Liberar e revogar quem entra no app',
  emoji: '🔑',
}

export function SettingsLinks() {
  const { isAdmin } = useAccess()

  const links = isAdmin ? [...LINKS, ADMIN_LINK] : LINKS

  return (
    <Card className="px-1 py-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/3"
        >
          <span aria-hidden className="text-lg">
            {link.emoji}
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-ink text-sm font-medium">{link.label}</span>
            <span className="text-ink-faint text-[11px]">{link.hint}</span>
          </span>
          <span aria-hidden className="text-ink-faint text-lg">
            ›
          </span>
        </Link>
      ))}
    </Card>
  )
}
