'use client'

// ============================================================
//  ZYNAPSE — LANDING PAGE (AUTH-AWARE)
//  File: app/page.tsx
//  Fix: Detects logged-in users → shows "Open App" + logout
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  ArrowRight, Dumbbell, Camera, Brain, Zap,
  Shield, Check, Star, ChevronDown, Globe,
  MessageCircle, Flame, TrendingUp, Timer,
  LogOut, LayoutDashboard,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─── Tokens ──────────────────────────────────────────────────
const L   = '#AAFF00'
const BG  = '#080808'
const C1  = '#0F0F0F'
const C2  = '#141414'
const BD  = '#1E1E1E'
const CYN = '#00D4FF'
const MUT = '#4A4A4A'
const SUB = '#777'
const FONT = "'Plus Jakarta Sans','Inter',sans-serif"

// ─── Types ───────────────────────────────────────────────────
type Ripple = { id: number; x: number; y: number }

// ─── Touch glow effect ───────────────────────────────────────
function TouchGlow() {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const add = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random()
    setRipples(p => [...p, { id, x, y }])
    setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 900)
  }, [])
  useEffect(() => {
    const onClick = (e: MouseEvent) => add(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => Array.from(e.touches).forEach(t => add(t.clientX, t.clientY))
    window.addEventListener('click', onClick)
    window.addEventListener('touchstart', onTouch, { passive: true })
    return () => { window.removeEventListener('click', onClick); window.removeEventListener('touchstart', onTouch) }
  }, [add])
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      <AnimatePresence>
        {ripples.map(r => (
          <motion.div key={r.id}
            initial={{ scale: 0.2, opacity: 0.5 }}
            animate={{ scale: 3.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.2, 0, 0.8, 1] }}
            style={{ position: 'fixed', left: r.x - 50, top: r.y - 50,
              width: 100, height: 100, borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(circle, rgba(170,255,0,0.3) 0%, rgba(170,255,0,0.05) 50%, transparent 70%)' }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Fade-up on scroll ───────────────────────────────────────
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}

// ─── Count-up ────────────────────────────────────────────────
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  const seen = useInView(ref, { once: true })
  useEffect(() => {
    if (!seen) return
    const dur = 1400, t0 = Date.now()
    const id = setInterval(() => {
      const p = Math.min((Date.now() - t0) / dur, 1)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * to))
      if (p >= 1) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [seen, to])
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>
}

// ─── Ticker ──────────────────────────────────────────────────
const TICKS = ['10K+ Users', '4.9 Star Rating', '50K+ Workouts', '98% Accuracy', 'AI-Powered', 'Free to Start', '10K+ Users', '4.9 Star Rating', '50K+ Workouts', '98% Accuracy', 'AI-Powered', 'Free to Start']

// ─── Features ────────────────────────────────────────────────
const FEATURES = [
  { icon: Dumbbell,    color: L,        bg: `${L}08`,                   label: 'WORKOUT',    title: 'Smart Workout Tracker',  desc: 'Log sets, reps, weights. AI adjusts your next session based on your recovery data.'   },
  { icon: Camera,      color: '#FF6B35', bg: 'rgba(255,107,53,0.07)',    label: 'FOOD AI',    title: 'Snap & Track Meals',     desc: 'Photo your plate. AI reads it in 2 seconds — calories, protein, carbs, fat. No typing.' },
  { icon: Brain,       color: '#A78BFA', bg: 'rgba(167,139,250,0.07)',   label: 'DETOX',      title: 'Dopamine Detox Hub',     desc: 'Track triggers, build streaks, run focus sessions. Break bad habits permanently.'       },
  { icon: TrendingUp,  color: CYN,       bg: 'rgba(0,212,255,0.07)',     label: 'GAMIFIED',   title: 'Discipline Score',       desc: 'Earn XP for every healthy habit. Level up. Top the leaderboard. Stay motivated.'       },
]

const STEPS = [
  { n: '01', title: 'Complete onboarding', desc: '2 minutes. Tell us your body, goals, and lifestyle.' },
  { n: '02', title: 'Get your plan',       desc: 'Instant calorie targets, workout split, and detox goals.' },
  { n: '03', title: 'Track and level up',  desc: 'Log daily. Watch your discipline score climb. Become elite.' },
]

const REVIEWS = [
  { name: 'Rafiq H.', badge: 'Lost 12kg', text: 'The meal scanner is insane. Snap a photo and it logs everything instantly.' },
  { name: 'Nadia I.', badge: 'Built 8kg muscle', text: 'AI told me to deload before I felt tired. Workout recommendations are scary good.' },
  { name: 'Arif M.', badge: '45-day streak', text: 'Zynapse kept me off social media for 45 days. My focus changed completely.' },
]

const FAQS = [
  { q: 'Is Zynapse free?',                      a: 'Core features are free forever. Premium unlocks meal photo storage, unlimited workouts, and advanced AI coaching.' },
  { q: 'How does the meal photo scanner work?', a: 'Take a photo of any food. Our Groq AI identifies it and returns full nutrition data in under 2 seconds.' },
  { q: 'What payment methods?',                 a: 'bKash, Nagad, Rocket, and all major cards via UddoktaPay. Fully encrypted and secure.' },
  { q: 'Can I cancel premium anytime?',         a: 'Yes. One tap from your profile page. No hidden fees, no questions asked.' },
]

const FREE_FEATURES = ['AI meal analysis', 'Basic workout tracking', '3 detox triggers', 'Daily calorie goal', 'Discipline score']
const PRO_FEATURES  = ['Everything in Free', 'Save unlimited meal photos', 'Unlimited workout plans', 'Advanced AI coaching', 'Progress analytics', 'No ads. Ever.']

// ════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function Page() {
  const router = useRouter()
  const supabase = createClient()

  const [yearly, setYearly]     = useState(false)
  const [openFaq, setOpenFaq]   = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // ── AUTH STATE ────────────────────────────────────────────
  const [authed, setAuthed]     = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAuthed(true)
        const name = user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'You'
        setUserName(name)
      }
      setAuthLoading(false)
    })
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    setAuthed(false)
    setUserName('')
  }

  // ── CTAs change based on auth state ──────────────────────
  const PrimaryCTA = authed
    ? <Link href="/dashboard"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm tracking-widest transition-all active:scale-95"
        style={{ background: L, color: '#000', boxShadow: '0 0 28px rgba(170,255,0,0.18)' }}>
        <LayoutDashboard size={16} strokeWidth={2.5} />
        OPEN APP
      </Link>
    : <Link href="/signup"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm tracking-widest transition-all active:scale-95"
        style={{ background: L, color: '#000', boxShadow: '0 0 28px rgba(170,255,0,0.18)' }}>
        START YOUR JOURNEY <ArrowRight size={16} strokeWidth={3} />
      </Link>

  const SecondaryCTA = authed
    ? <button type="button" onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-sm tracking-widest transition-all active:scale-95"
        style={{ background: 'transparent', color: '#888', border: `1.5px solid ${BD}` }}>
        <LogOut size={15} /> SIGN OUT
      </button>
    : <Link href="/login"
        className="flex items-center justify-center w-full py-4 rounded-2xl font-bold text-sm tracking-widest transition-all active:scale-95"
        style={{ background: 'transparent', color: '#bbb', border: `1.5px solid ${BD}` }}>
        I ALREADY HAVE AN ACCOUNT
      </Link>

  return (
    <>
      <TouchGlow />
      <div style={{ background: BG, color: '#fff', overflowX: 'hidden', fontFamily: FONT }}>
        <style>{`
          *{box-sizing:border-box}
          ::-webkit-scrollbar{width:2px}
          ::-webkit-scrollbar-thumb{background:${L};border-radius:1px}
          html{scroll-behavior:smooth}
          @keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
          .tk{display:flex;animation:tick 22s linear infinite;width:max-content}
          .tk:hover{animation-play-state:paused}
          a{text-decoration:none}
        `}</style>

        {/* ══════════════════════════════════════════════════
            NAV
        ══════════════════════════════════════════════════ */}
        <nav className="fixed top-0 left-0 right-0 z-50"
          style={{ background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${BD}` }}>
          <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: L }}>
                <Zap size={13} color="#000" strokeWidth={3} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '0.1em' }}>ZYNAPSE</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6">
              {['Features', 'Pricing', 'FAQ'].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} style={{ color: SUB, fontSize: 13, fontWeight: 600 }}
                  className="hover:text-white transition-colors">{l}</a>
              ))}
            </div>

            {/* Right — changes based on auth */}
            <div className="flex items-center gap-2">
              {!authLoading && (
                authed
                  ? <>
                      <span className="hidden md:block text-sm" style={{ color: SUB }}>
                        Hey, {userName} 👋
                      </span>
                      <Link href="/dashboard"
                        className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold"
                        style={{ background: L, color: '#000' }}>
                        <LayoutDashboard size={13} /> Open App
                      </Link>
                      <button type="button" onClick={handleLogout}
                        className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: C2, border: `1px solid ${BD}`, color: SUB }}>
                        <LogOut size={13} /> Sign out
                      </button>
                    </>
                  : <>
                      <Link href="/login"
                        className="hidden md:block text-sm font-semibold px-3 py-2"
                        style={{ color: SUB }}>
                        Log in
                      </Link>
                      <Link href="/signup"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold"
                        style={{ background: L, color: '#000' }}>
                        Get Started <ArrowRight size={12} strokeWidth={3} />
                      </Link>
                    </>
              )}

              {/* Mobile menu */}
              <button type="button"
                className="md:hidden ml-1 p-1.5 rounded-lg"
                style={{ background: C2, border: `1px solid ${BD}` }}
                onClick={() => setMenuOpen(v => !v)}>
                <div style={{ width: 16, height: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {[0,1,2].map(i => <div key={i} style={{ height: 1.5, background: '#fff', borderRadius: 2, width: i === 1 ? '70%' : '100%' }} />)}
                </div>
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', borderTop: `1px solid ${BD}` }}>
                <div className="px-4 py-4 flex flex-col gap-3">
                  {['Features', 'Pricing', 'FAQ'].map(l => (
                    <a key={l} href={`#${l.toLowerCase()}`} style={{ color: '#ccc', fontSize: 14, fontWeight: 600 }}
                      onClick={() => setMenuOpen(false)}>{l}</a>
                  ))}
                  {authed
                    ? <>
                        <Link href="/dashboard" style={{ color: L, fontSize: 14, fontWeight: 700 }} onClick={() => setMenuOpen(false)}>Open App</Link>
                        <button type="button" onClick={() => { handleLogout(); setMenuOpen(false) }}
                          style={{ color: SUB, fontSize: 14, textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                          Sign out
                        </button>
                      </>
                    : <Link href="/login" style={{ color: SUB, fontSize: 14 }} onClick={() => setMenuOpen(false)}>Log in</Link>
                  }
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-14">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(170,255,0,0.05) 0%, transparent 70%)', filter: 'blur(30px)' }} />

          <div className="max-w-md mx-auto px-5 flex flex-col items-center text-center pt-8 pb-6">

            {/* Live badge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(170,255,0,0.07)', border: `1px solid rgba(170,255,0,0.15)` }}>
              <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: L }} />
              <span style={{ color: L, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em' }}>AI-POWERED FITNESS ECOSYSTEM</span>
            </motion.div>

            {/* Wordmark */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {/* Visible brand name (aria-hidden so screen readers use the h1 below) */}
              <p aria-hidden="true" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.2em', color: '#fff', marginBottom: 4 }}>ZYNAPSE</p>
              {/* SEO H1 — visually hidden but fully crawlable */}
              <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
                Zynapse — AI Fitness &amp; Nutrition Coach: Workout Tracker and Meal Scanner
              </h1>
              <p style={{ color: CYN, fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', marginBottom: 18 }}>AI FOR A BETTER YOU</p>
            </motion.div>

            {/* Hero image */}
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="relative mb-5" style={{ width: '100%', maxWidth: 280, height: 260 }}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[200, 160, 124].map((s, i) => (
                  <motion.div key={i} animate={{ scale: [1, 1.04, 1], opacity: [0.2, 0.35, 0.2] }}
                    transition={{ repeat: Infinity, duration: 3 + i, delay: i * 0.6 }}
                    className="absolute rounded-full"
                    style={{ width: s, height: s, border: `1px solid ${i < 2 ? 'rgba(170,255,0,0.2)' : 'rgba(0,212,255,0.12)'}` }} />
                ))}
                <div className="absolute w-28 h-28 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(170,255,0,0.08) 0%, transparent 70%)' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div style={{ position: 'relative', width: 180, height: 250 }}>
                  <Image src="/images/Body-Builder.png" alt="Zynapse athlete" fill className="object-cover object-top" priority />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 50%, ${BG} 100%)` }} />
                </div>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h2 style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>
                TRAIN. <span style={{ color: L }}>FUEL.</span> FOCUS.
              </h2>
              <p style={{ color: SUB, fontSize: 13, lineHeight: 1.7, marginBottom: 22, maxWidth: 280 }}>
                The only app that tracks workouts, food, and mental discipline — all powered by AI.
              </p>
            </motion.div>

            {/* ── AUTH-AWARE CTAs ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!authLoading && (
                <>
                  {/* Show personalized welcome if logged in */}
                  {authed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="px-4 py-3 rounded-2xl mb-1 flex items-center gap-2"
                      style={{ background: 'rgba(170,255,0,0.06)', border: `1px solid rgba(170,255,0,0.15)` }}>
                      <Zap size={14} color={L} fill={L} />
                      <span style={{ color: '#ccc', fontSize: 13 }}>
                        Welcome back, <span style={{ color: L, fontWeight: 700 }}>{userName}</span> 👋
                      </span>
                    </motion.div>
                  )}
                  {PrimaryCTA}
                  {SecondaryCTA}
                </>
              )}
            </motion.div>

            {/* Security note */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="flex items-center gap-1.5 mt-4">
              <Shield size={12} color={MUT} />
              <span style={{ color: MUT, fontSize: 11 }}>Your data is secure and encrypted</span>
            </motion.div>
          </div>
        </section>

        {/* ══ TICKER ══ */}
        <div style={{ background: C1, borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, padding: '10px 0', overflow: 'hidden' }}>
          <div className="tk">
            {TICKS.map((t, i) => (
              <div key={i} className="flex items-center gap-2.5 px-5 whitespace-nowrap">
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: L, flexShrink: 0 }} />
                <span style={{ color: SUB, fontSize: 11, fontWeight: 600 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ STATS ══ */}
        <section className="py-12 px-5 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: 10000, suffix: '+', label: 'Active Users', color: L,        icon: Flame     },
              { val: 50000, suffix: '+', label: 'Meals Tracked', color: '#FF6B35', icon: Camera    },
              { val: 98,    suffix: '%', label: 'Goal Accuracy', color: CYN,      icon: TrendingUp },
              { val: 4.9,   suffix: '★', label: 'User Rating',  color: '#FFB800', icon: Star      },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <FadeUp key={i} delay={i * 0.08}>
                  <div className="p-4 rounded-2xl" style={{ background: C2, border: `1px solid ${BD}` }}>
                    <Icon size={16} color={s.color} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                      <CountUp to={s.val} suffix={s.suffix} />
                    </div>
                    <div style={{ color: SUB, fontSize: 11, marginTop: 4 }}>{s.label}</div>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </section>

        {/* ══ FEATURES ══ */}
        <section id="features" className="py-12 px-5" style={{ background: C1 }}>
          <div className="max-w-md mx-auto">
            <FadeUp className="mb-8">
              <p style={{ color: L, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', marginBottom: 6 }}>FEATURES</p>
              <h2 style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>Four systems.<br /><span style={{ color: L }}>One platform.</span></h2>
            </FadeUp>
            <div className="flex flex-col gap-3">
              {FEATURES.map((f, i) => {
                const Icon = f.icon
                return (
                  <FadeUp key={i} delay={i * 0.08}>
                    <div className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: C2, border: `1px solid ${BD}` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: f.bg }}>
                        <Icon size={18} color={f.color} />
                      </div>
                      <div className="flex-1">
                        <span style={{ color: f.color, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em' }}>{f.label}</span>
                        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '3px 0 5px' }}>{f.title}</h3>
                        <p style={{ color: SUB, fontSize: 12, lineHeight: 1.6 }}>{f.desc}</p>
                      </div>
                    </div>
                  </FadeUp>
                )
              })}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section id="how-it-works" className="py-12 px-5 max-w-md mx-auto">
          <FadeUp className="mb-8">
            <p style={{ color: L, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', marginBottom: 6 }}>HOW IT WORKS</p>
            <h2 style={{ fontSize: 22, fontWeight: 900 }}>Ready in <span style={{ color: L }}>2 minutes.</span></h2>
          </FadeUp>
          <div className="flex flex-col gap-3">
            {STEPS.map((s, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: C2, border: `1px solid ${BD}` }}>
                  <span style={{ color: L, fontSize: 22, fontWeight: 900, lineHeight: 1, flexShrink: 0, minWidth: 32 }}>{s.n}</span>
                  <div>
                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.title}</h3>
                    <p style={{ color: SUB, fontSize: 12, lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* ══ REVIEWS ══ */}
        <section className="py-12 px-5" style={{ background: C1 }}>
          <div className="max-w-md mx-auto">
            <FadeUp className="mb-8">
              <h2 style={{ fontSize: 22, fontWeight: 900 }}>Real people. <span style={{ color: L }}>Real results.</span></h2>
            </FadeUp>
            <div className="flex flex-col gap-3">
              {REVIEWS.map((r, i) => (
                <FadeUp key={i} delay={i * 0.08}>
                  <div className="p-4 rounded-2xl" style={{ background: C2, border: `1px solid ${BD}` }}>
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, j) => <Star key={j} size={11} color="#FFB800" fill="#FFB800" />)}
                    </div>
                    <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.65, marginBottom: 10 }}>&ldquo;{r.text}&rdquo;</p>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{r.name}</div>
                    <div style={{ color: L, fontSize: 11, marginTop: 2 }}>{r.badge}</div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PRICING ══ */}
        <section id="pricing" className="py-12 px-5 max-w-md mx-auto">
          <FadeUp className="mb-8">
            <p style={{ color: L, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', marginBottom: 6 }}>PRICING</p>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 14 }}>Simple. <span style={{ color: L }}>Fair.</span></h2>
            <div className="inline-flex p-1 rounded-xl gap-1" style={{ background: C2 }}>
              {(['Monthly', 'Yearly'] as const).map(p => (
                <button key={p} type="button" onClick={() => setYearly(p === 'Yearly')}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: (p === 'Yearly') === yearly ? L : 'transparent', color: (p === 'Yearly') === yearly ? '#000' : SUB }}>
                  {p}{p === 'Yearly' && <span className="ml-1 opacity-80">−71%</span>}
                </button>
              ))}
            </div>
          </FadeUp>
          <div className="flex flex-col gap-4">
            <FadeUp>
              <div className="p-5 rounded-2xl" style={{ background: C2, border: `1px solid ${BD}` }}>
                <div style={{ color: SUB, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 6 }}>FREE</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 16 }}>0 <span style={{ fontSize: 13, color: SUB, fontWeight: 400 }}>BDT forever</span></div>
                <div className="flex flex-col gap-2.5 mb-5">
                  {FREE_FEATURES.map(f => (
                    <div key={f} className="flex items-center gap-2"><Check size={13} color={MUT} /><span style={{ color: '#aaa', fontSize: 13 }}>{f}</span></div>
                  ))}
                </div>
                <Link href="/signup" className="block w-full py-3.5 rounded-xl text-center font-bold text-sm" style={{ background: BD, color: '#ccc' }}>Start Free</Link>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="p-5 rounded-2xl relative" style={{ background: 'rgba(170,255,0,0.04)', border: `2px solid ${L}` }}>
                <div className="absolute -top-3 left-5 px-3 py-1 rounded-full text-xs font-black" style={{ background: L, color: '#000' }}>MOST POPULAR</div>
                <div style={{ color: L, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 6, marginTop: 6 }}>PREMIUM</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
                  {yearly ? '699' : '199'} <span style={{ fontSize: 13, color: SUB, fontWeight: 400 }}>BDT / {yearly ? 'year' : 'month'}</span>
                </div>
                {yearly && <p style={{ color: L, fontSize: 11, marginBottom: 12 }}>Only 58 BDT/month!</p>}
                <div className="flex flex-col gap-2.5 mb-5 mt-4">
                  {PRO_FEATURES.map(f => (
                    <div key={f} className="flex items-center gap-2"><Check size={13} color={L} /><span style={{ color: '#ddd', fontSize: 13 }}>{f}</span></div>
                  ))}
                </div>
                <Link href="/signup?plan=premium" className="block w-full py-3.5 rounded-xl text-center font-black text-sm" style={{ background: L, color: '#000', boxShadow: '0 0 20px rgba(170,255,0,0.18)' }}>Get Premium</Link>
                <p className="text-center mt-2" style={{ color: MUT, fontSize: 11 }}>bKash · Nagad · Rocket · Card</p>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ══ FAQ ══ */}
        <section id="faq" className="py-12 px-5" style={{ background: C1 }}>
          <div className="max-w-md mx-auto">
            <FadeUp className="mb-8">
              <h2 style={{ fontSize: 22, fontWeight: 900 }}>Got <span style={{ color: L }}>questions?</span></h2>
            </FadeUp>
            <div className="flex flex-col gap-2">
              {FAQS.map((f, i) => (
                <FadeUp key={i} delay={i * 0.05}>
                  <div className="rounded-2xl overflow-hidden" style={{ background: C2, border: `1px solid ${BD}` }}>
                    <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left">
                      <span style={{ color: '#fff', fontWeight: 600, fontSize: 13, paddingRight: 12 }}>{f.q}</span>
                      <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0 }}>
                        <ChevronDown size={16} color={SUB} />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                          <div className="px-4 pb-4" style={{ borderTop: `1px solid ${BD}` }}>
                            <p className="pt-3" style={{ color: SUB, fontSize: 13, lineHeight: 1.65 }}>{f.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="py-16 px-5" style={{ background: BG }}>
          <div className="max-w-md mx-auto text-center">
            <FadeUp>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(170,255,0,0.1)', border: `1px solid rgba(170,255,0,0.2)` }}>
                <Zap size={22} color={L} />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>
                Your best self is<br /><span style={{ color: L }}>one decision away.</span>
              </h2>
              <p style={{ color: SUB, fontSize: 13, marginBottom: 22, lineHeight: 1.65 }}>
                Join 10,000+ users already training smarter.
              </p>
              {authed
                ? <Link href="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm tracking-widest"
                    style={{ background: L, color: '#000' }}>
                    <LayoutDashboard size={16} /> OPEN YOUR APP
                  </Link>
                : <Link href="/signup"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm tracking-widest"
                    style={{ background: L, color: '#000', boxShadow: '0 0 30px rgba(170,255,0,0.18)' }}>
                    START YOUR JOURNEY <ArrowRight size={16} strokeWidth={3} />
                  </Link>
              }
              <p style={{ color: MUT, fontSize: 11, marginTop: 10 }}>Free · No credit card needed</p>
            </FadeUp>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="py-8 px-5" style={{ borderTop: `1px solid ${BD}` }}>
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: L }}>
                  <Zap size={12} color="#000" strokeWidth={3} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.1em' }}>ZYNAPSE</span>
              </Link>
              <div className="flex gap-2">
                {[Globe, MessageCircle].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: C2, border: `1px solid ${BD}` }}>
                    <Icon size={13} color={SUB} />
                  </a>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { t: 'Product', ls: ['Features', 'Pricing', 'How It Works'] },
                { t: 'Support', ls: ['FAQ', 'Contact', 'Privacy'] },
                { t: 'Legal',   ls: ['Terms', 'Privacy Policy', 'Cookies'] },
              ].map(col => (
                <div key={col.t}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 11, marginBottom: 8 }}>{col.t}</div>
                  {col.ls.map(l => <a key={l} href="#" className="block mb-1.5" style={{ color: MUT, fontSize: 11 }}>{l}</a>)}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-5" style={{ borderTop: `1px solid ${BD}` }}>
              <span style={{ color: MUT, fontSize: 11 }}>© 2025 Zynapse</span>
              <div className="flex items-center gap-1.5">
                <Shield size={11} color={MUT} />
                <span style={{ color: MUT, fontSize: 11 }}>bKash · Nagad · Rocket</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}