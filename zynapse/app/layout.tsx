import type { Metadata, Viewport } from 'next'
import { Syne } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Zynapse — AI Fitness Coach',
  description: 'Train smarter. Eat better. Live focused. AI-powered fitness & nutrition platform.',
  keywords: ['fitness', 'AI coach', 'workout', 'nutrition', 'health'],
  authors: [{ name: 'Zynapse' }],
  openGraph: {
    title: 'Zynapse — AI Fitness Coach',
    description: 'Your AI-powered personal fitness coach.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0A0A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={syne.variable}>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: '#0A0A0A',
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