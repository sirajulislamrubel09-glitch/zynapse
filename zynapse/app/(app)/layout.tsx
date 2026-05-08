'use client'

// ============================================================
//  ZYNAPSE — APP LAYOUT WITH BOTTOM NAVIGATION
//  File location: app/(app)/layout.tsx
// ============================================================

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Dumbbell, Apple, Brain, User } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Home',    icon: Home     },
  { href: '/workout',   label: 'Workout', icon: Dumbbell },
  { href: '/food',      label: 'Food',    icon: Apple    },
  { href: '/coach',     label: 'Coach',   icon: Brain    },
  { href: '/profile',   label: 'Profile', icon: User     },
]

const LIME = '#C8FF00'
const BG   = '#0A0A0A'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto relative"
      style={{ background: BG, fontFamily: "'Syne', 'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* ── Bottom Navigation Bar ─────────────────────────── */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4 pb-4"
      >
        <div
          className="flex items-center justify-around py-3 px-2 rounded-3xl"
          style={{
            background: 'rgba(18,18,18,0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.5)',
          }}
        >
          {NAV.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-1 relative"
              >
                {/* Active pill indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'rgba(200,255,0,0.1)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}

                <Icon
                  size={22}
                  color={isActive ? LIME : '#555'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className="text-xs font-semibold relative z-10"
                  style={{ color: isActive ? LIME : '#555' }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}