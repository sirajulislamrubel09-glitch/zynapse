'use client'

// ============================================================
//  ZYNAPSE — APP LAYOUT
//  File: app/(app)/layout.tsx
//  Replace your entire current file with this
// ============================================================

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Dumbbell, Brain, Salad,
  User, Plus, X, UtensilsCrossed, Timer,
  Droplets, Activity,
} from 'lucide-react'

// ─── Design ──────────────────────────────────────────────────
const LIME = '#AAFF00'
const BG   = '#080808'

// ─── Nav items (no + in the array — it's rendered separately) ─
const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workout',   label: 'Workouts',  icon: Dumbbell        },
  null, // placeholder for center FAB
  { href: '/coach',     label: 'Coach',     icon: Brain           },
  { href: '/profile',   label: 'Profile',   icon: User            },
]

// ─── Quick-action items (opened by + button) ──────────────────
const QUICK_ACTIONS = [
  { label: 'Log Meal',          icon: UtensilsCrossed, href: '/food?action=log',     color: '#FF6B35' },
  { label: 'Log Workout',       icon: Dumbbell,        href: '/workout?action=log',  color: LIME      },
  { label: 'Start Focus Timer', icon: Timer,           href: '/coach?action=focus',  color: '#A78BFA' },
  { label: 'Log Water',         icon: Droplets,        href: '/food?action=water',   color: '#00D4FF' },
  { label: 'Check-in',          icon: Activity,        href: '/dashboard?checkin=1', color: '#FFB800' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [fabOpen, setFabOpen] = useState(false)

  function handleAction(href: string) {
    setFabOpen(false)
    router.push(href)
  }

  return (
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto relative"
      style={{ background: BG, fontFamily: "'Syne','Inter',sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{display:none}
      `}</style>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-28">
        {children}
      </main>

      {/* ── Quick action sheet backdrop ───────────────────── */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setFabOpen(false)}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      {/* ── Quick action items ────────────────────────────── */}
      <AnimatePresence>
        {fabOpen && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-md px-5 z-50">
            <div className="flex flex-col gap-2.5">
              {QUICK_ACTIONS.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ delay: (QUICK_ACTIONS.length - 1 - i) * 0.05, duration: 0.25 }}
                    onClick={() => handleAction(item.href)}
                    type="button"
                    className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-left transition-all active:scale-98"
                    style={{ background: 'rgba(20,20,20,0.98)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}18` }}
                    >
                      <Icon size={18} color={item.color} />
                    </div>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                      {item.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Bottom navigation ─────────────────────────────── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4 pb-5">
        <div
          className="flex items-center justify-around py-2 px-2 rounded-3xl relative"
          style={{
            background: 'rgba(14,14,14,0.97)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
          }}
        >
          {NAV.map((item, idx) => {
            // Center FAB slot
            if (item === null) {
              return (
                <div key="fab" className="relative flex items-center justify-center" style={{ width: 56 }}>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFabOpen(v => !v)}
                    className="absolute -top-7 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all"
                    style={{
                      background: fabOpen ? '#fff' : LIME,
                      boxShadow: `0 0 0 4px rgba(14,14,14,0.97), 0 0 20px ${LIME}44`,
                    }}
                  >
                    <motion.div
                      animate={{ rotate: fabOpen ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Plus size={24} color="#000" strokeWidth={2.5} />
                    </motion.div>
                  </motion.button>
                </div>
              )
            }

            const Icon = item.icon
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-2 py-1.5 relative rounded-xl transition-all"
                style={{ minWidth: 52 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(170,255,0,0.08)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                  />
                )}
                <Icon
                  size={20}
                  color={isActive ? LIME : '#444'}
                  strokeWidth={isActive ? 2.2 : 1.7}
                />
                <span
                  className="relative z-10"
                  style={{ color: isActive ? LIME : '#444', fontSize: 10, fontWeight: 600 }}
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