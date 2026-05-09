// ============================================================
//  ZYNAPSE — ROOT LAYOUT (FIXED)
//  File: app/layout.tsx
//  Replace your ENTIRE current layout.tsx with this
// ============================================================

import type { Metadata, Viewport } from 'next'
import { Syne } from 'next/font/google'
import './globals.css'

// Syne font — matches our design system
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

// App metadata
export const metadata: Metadata = {
  title: 'Zynapse — AI For A Better You',
  description:
    'Train smarter. Eat better. Live focused. AI-powered fitness, nutrition & discipline ecosystem.',
  keywords: ['fitness', 'AI', 'workout', 'nutrition', 'dopamine detox', 'health'],
  authors: [{ name: 'Zynapse' }],
  openGraph: {
    title: 'Zynapse — AI For A Better You',
    description: 'Your AI-powered fitness companion. Track. Train. Transform.',
    type: 'website',
    url: 'https://zynapse-ai.vercel.app',
  },
}

// THIS fixes "screen too big" on mobile
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080808',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={syne.variable}>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: '#080808',
          overflowX: 'hidden',
          fontFamily: 'var(--font-syne), Inter, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {children}
      </body>
    </html>
  )
}