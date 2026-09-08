import { AppShell } from '@/features/platform/components/app-shell'

type PublicLayoutProps = {
  children: React.ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return <AppShell>{children}</AppShell>
}
