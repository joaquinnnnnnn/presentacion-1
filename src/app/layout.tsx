import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import SessionInit from '@/components/SessionInit'

export const metadata: Metadata = { title: 'Clarifi', description: 'Finanzas personales' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <SessionInit />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
