import type { Metadata, Viewport } from 'next'
import { Syne } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zynapse.app'

export const metadata: Metadata = {
  title: {
    default: 'Zynapse | AI Fitness & Nutrition Coach — Workout Tracker, Meal Scanner',
    template: '%s | Zynapse',
  },
  description:
    'Zynapse is an AI-powered fitness platform that tracks your workouts, scans meals from photos for instant nutrition data, and gamifies your discipline. Free to start.',
  keywords: [
    'AI fitness coach',
    'AI workout tracker',
    'meal photo scanner',
    'calorie tracking app',
    'AI nutrition coach',
    'dopamine detox app',
    'discipline score',
    'fitness gamification',
    'Bangladesh fitness app',
    'bKash fitness subscription',
  ],
  authors: [{ name: 'Zynapse', url: SITE_URL }],
  creator: 'Zynapse',
  publisher: 'Zynapse',
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Zynapse',
    title: 'Zynapse | AI Fitness & Nutrition Coach',
    description:
      'Track workouts, scan meals with AI, and gamify your discipline. 10,000+ users. Free to start.',
    images: [
      {
        url: `${SITE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Zynapse — AI Fitness & Nutrition Coach',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zynapse | AI Fitness & Nutrition Coach',
    description:
      'Track workouts, scan meals with AI, and gamify your discipline. Free to start.',
    images: [`${SITE_URL}/images/og-image.png`],
    creator: '@zynapse_ai',
    site: '@zynapse_ai',
  },
  applicationName: 'Zynapse',
  category: 'health & fitness',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0A0A',
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Zynapse',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web, iOS, Android',
      url: SITE_URL,
      description:
        'AI-powered fitness platform that tracks workouts, scans meals from photos, and gamifies discipline.',
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'BDT',
          name: 'Free Plan',
          description: 'AI meal analysis, basic workout tracking, 3 detox triggers, daily calorie goal, discipline score.',
        },
        {
          '@type': 'Offer',
          price: '199',
          priceCurrency: 'BDT',
          name: 'Premium Plan',
          description: 'Everything in Free plus unlimited meal photos, unlimited workout plans, advanced AI coaching, and progress analytics.',
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '10000',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'AI workout tracking with recovery-based adjustments',
        'Meal photo scanner with instant nutrition data',
        'Dopamine detox habit tracker',
        'Gamified discipline score and leaderboard',
        'Personalized calorie and macro targets',
      ],
    },
    {
      '@type': 'Organization',
      name: 'Zynapse',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/og-image.png`,
      },
    },
    {
      '@type': 'WebSite',
      name: 'Zynapse',
      url: SITE_URL,
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is Zynapse free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Core features are free forever. Premium unlocks meal photo storage, unlimited workouts, and advanced AI coaching for 199 BDT/month.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does the meal photo scanner work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Take a photo of any food. Zynapse AI identifies it and returns full nutrition data — calories, protein, carbs, and fat — in under 2 seconds.',
          },
        },
        {
          '@type': 'Question',
          name: 'What payment methods does Zynapse accept?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Zynapse accepts bKash, Nagad, Rocket, and all major cards via UddoktaPay. All payments are fully encrypted and secure.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I cancel Zynapse premium anytime?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Cancel with one tap from your profile page. No hidden fees, no questions asked.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={syne.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
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
