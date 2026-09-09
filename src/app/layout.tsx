import '@/app/globals.css'

import type { Metadata, Viewport } from 'next'
import {
  JetBrains_Mono as JetBrainsMono,
  Manrope,
  Sora,
} from 'next/font/google'

import { AppSplash } from '@/features/platform/components/app-splash'
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_SPLASH_ID,
} from '@/features/platform/constants/app-identity.constants'
import { AppProviders } from '@/features/platform/providers/app-providers'

const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-sora',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
})

const jetBrainsMono = JetBrainsMono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
  },
  /* O Next só emite o `mobile-web-app-capable` padrão; o iOS antes do 16.4 lê
     apenas o nome com prefixo da Apple para abrir em tela cheia. */
  other: { 'apple-mobile-web-app-capable': 'yes' },
}

export const viewport: Viewport = {
  themeColor: '#08090B',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${manrope.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        {/* Servida no HTML: aparece na primeira pintura, sem esperar o bundle.
            O `AppSplashDismiss` a apaga quando o React assume. */}
        <div id={APP_SPLASH_ID} aria-hidden="true">
          <AppSplash />
        </div>

        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
