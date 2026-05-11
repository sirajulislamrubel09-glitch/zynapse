'use client'

// ============================================================
//  ZYNAPSE — AI COACH PAGE (FIXED)
//  File: app/(app)/coach/page.tsx
//
//  Fixes:
//  1. React Error #418 — all Date() calls moved to useEffect
//  2. Brief refresh properly re-fetches
//  3. Chat is more robust
// ============================================================

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Zap, ChevronRight, Dumbbell, Send,
  Apple, Moon, Heart, Lock, Sparkles,
  RefreshCw,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─── Tokens ──────────────────────────────────────────────────
const L    = '#AAFF00'
const P    = '#A78BFA'
const BG   = '#080808'
const C    = '#0D0D0D'
const BD   = '#1A1A1A'
const W    = '#FFFFFF'
const G1   = '#777'
const G2   = '#2A2A2A'
const FONT = "'Plus Jakarta Sans','Inter',sans-serif"

// ─── Types ───────────────────────────────────────────────────
type Msg  = { role: 'user' | 'ai'; text: string; id: number }
type Prof = {
  full_name: string; fitness_goal: string
  daily_calorie_goal: number; is_premium: boolean
}

// ─── Recommendations by goal ──────────────────────────────────
const RECS: Record<string, {
  icon: typeof Dumbbell; color: string; bg: string
  category: string; action: string; href: string
}[]> = {
  build_muscle: [
    { icon: Dumbbell, color: L,         bg: `${L}10`,                   category: 'Workout',   action: 'Push Day — Chest focus. 4×8 Bench Press to start.',         href: '/workout' },
    { icon: Apple,    color: '#FF6B35', bg: 'rgba(255,107,53,0.08)',    category: 'Nutrition', action: 'Increase protein by 20g. Add a chicken breast at lunch.',     href: '/food'    },
    { icon: Moon,     color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',    category: 'Recovery',  action: 'Target 7.5h sleep tonight. Muscle grows while you rest.',     href: '/profile' },
    { icon: Heart,    color: P,         bg: `${P}10`,                   category: 'Mindset',   action: '10 min meditation before bed. Discipline builds in silence.', href: '/coach'   },
  ],
  lose_fat: [
    { icon: Dumbbell, color: L,         bg: `${L}10`,                   category: 'Workout',   action: 'HIIT session — 20 min. Keep heart rate at 75–85% max.',      href: '/workout' },
    { icon: Apple,    color: '#FF6B35', bg: 'rgba(255,107,53,0.08)',    category: 'Nutrition', action: 'Stay in deficit. Prioritize protein — 150g minimum today.',   href: '/food'    },
    { icon: Moon,     color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',    category: 'Recovery',  action: 'Quality sleep cuts cortisol. Aim for 8 hours tonight.',       href: '/profile' },
    { icon: Heart,    color: P,         bg: `${P}10`,                   category: 'Mindset',   action: 'Progress over perfection. One meal does not break a diet.',   href: '/coach'   },
  ],
  lean_bulk: [
    { icon: Dumbbell, color: L,         bg: `${L}10`,                   category: 'Workout',   action: 'Upper body A — progressive overload on pressing movements.',  href: '/workout' },
    { icon: Apple,    color: '#FF6B35', bg: 'rgba(255,107,53,0.08)',    category: 'Nutrition', action: 'Slight surplus today — 200 kcal over maintenance.',           href: '/food'    },
    { icon: Moon,     color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',    category: 'Recovery',  action: 'Stretch hip flexors tonight. Mobility = better lifts.',       href: '/profile' },
    { icon: Heart,    color: P,         bg: `${P}10`,                   category: 'Mindset',   action: 'Trust the process. Lean bulk takes months, not weeks.',       href: '/coach'   },
  ],
  athletic_body: [
    { icon: Dumbbell, color: L,         bg: `${L}10`,                   category: 'Workout',   action: 'Power session — box jumps, cleans, sprint intervals.',        href: '/workout' },
    { icon: Apple,    color: '#FF6B35', bg: 'rgba(255,107,53,0.08)',    category: 'Nutrition', action: 'Carb-load before training. Performance needs fuel.',           href: '/food'    },
    { icon: Moon,     color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',    category: 'Recovery',  action: 'Cold shower post-session. Reduces inflammation fast.',        href: '/profile' },
    { icon: Heart,    color: P,         bg: `${P}10`,                   category: 'Mindset',   action: 'Champions train when they do not feel like it. Go.',          href: '/coach'   },
  ],
  maintain_fitness: [
    { icon: Dumbbell, color: L,         bg: `${L}10`,                   category: 'Workout',   action: 'Full body session — moderate intensity, all patterns.',       href: '/workout' },
    { icon: Apple,    color: '#FF6B35', bg: 'rgba(255,107,53,0.08)',    category: 'Nutrition', action: 'Maintenance calories. Balanced macros across all meals.',      href: '/food'    },
    { icon: Moon,     color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',    category: 'Recovery',  action: 'One full rest day per week. Sustainability is the goal.',      href: '/profile' },
    { icon: Heart,    color: P,         bg: `${P}10`,                   category: 'Mindset',   action: 'Consistency over intensity. Show up every single day.',        href: '/coach'   },
  ],
}

// ─── Typing dots ─────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5,
      padding: '12px 14px', borderRadius: 18, borderBottomLeftRadius: 4,
      background: '#161616', width: 'fit-content' }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18 }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: P }}
        />
      ))}
    </div>
  )
}

// ─── Pulse ring ───────────────────────────────────────────────
function PulseRing() {
  return (
    <>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          style={{ position: 'absolute', borderRadius: '50%',
            border: `1px solid ${P}`,
            width: 52 + i * 18, height: 52 + i * 18,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)' }}
          animate={{ opacity: [0, 0.35, 0], scale: [0.88, 1.08, 1.08] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.55, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

// ─── Skeleton ────────────────────────────────────────────────
function Sk({ w = '100%', h = 14 }: { w?: string | number; h?: number }) {
  return (
    <motion.div animate={{ opacity: [0.15, 0.35, 0.15] }}
      transition={{ repeat: Infinity, duration: 1.6 }}
      style={{ width: w, height: h, borderRadius: 6, background: '#1e1e1e' }} />
  )
}

// ════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function CoachPage() {
  const supabase    = createClient()
  const chatEndRef  = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLInputElement>(null)

  const [loading, setLoading]         = useState(true)
  const [profile, setProfile]         = useState<Prof | null>(null)
  const [stats, setStats]             = useState({ kcal: 0, workouts: 0, streak: 0 })
  const [brief, setBrief]             = useState('')
  const [briefLoading, setBriefLoading] = useState(true)
  const [messages, setMessages]       = useState<Msg[]>([])
  const [input, setInput]             = useState('')
  const [aiTyping, setAiTyping]       = useState(false)
  const [msgCount, setMsgCount]       = useState(0)
  const [dateStr, setDateStr]         = useState('') // FIX: not SSR
  const [greetStr, setGreetStr]       = useState('')  // FIX: not SSR
  const FREE_LIMIT = 5

  // ── FIX #418: Set date ONLY on client ────────────────────
  useEffect(() => {
    const now = new Date()
    const h   = now.getHours()
    setDateStr(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))
    setGreetStr(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening')
  }, [])

  // ── Fetch brief ──────────────────────────────────────────
  const fetchBrief = useCallback(async (
    p: Prof | null,
    s: { kcal: number; workouts: number; streak: number }
  ) => {
    setBriefLoading(true)
    setBrief('')
    try {
      const r = await fetch('/api/ai/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:              p?.full_name?.split(' ')[0] ?? 'Champion',
          goal:              p?.fitness_goal ?? 'build_muscle',
          caloriesConsumed:  s.kcal,
          calorieGoal:       p?.daily_calorie_goal ?? 2000,
          workoutsToday:     s.workouts,
          detoxStreak:       s.streak,
        }),
      })
      if (r.ok) {
        const j = await r.json()
        setBrief(j.insight ?? '')
      }
    } catch { /* use fallback below */ }
    finally {
      setBriefLoading(false)
    }
  }, [])

  // ── Load data ────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date().toISOString().split('T')[0]
        const [pR, mR, wR, dR] = await Promise.all([
          supabase.from('profiles').select('full_name,fitness_goal,daily_calorie_goal,is_premium').eq('id', user.id).single(),
          supabase.from('meals').select('calories').eq('user_id', user.id).gte('logged_at', `${today}T00:00:00`),
          supabase.from('workout_logs').select('id').eq('user_id', user.id).gte('created_at', `${today}T00:00:00`),
          supabase.from('detox_logs').select('streak_current').eq('user_id', user.id).eq('status', 'active').order('streak_current', { ascending: false }).limit(1),
        ])

        const p   = pR.data as Prof | null
        const m   = mR.data ?? []
        const s   = {
          kcal:     m.reduce((acc, x) => acc + (x.calories ?? 0), 0),
          workouts: (wR.data ?? []).length,
          streak:   dR.data?.[0]?.streak_current ?? 0,
        }
        setProfile(p)
        setStats(s)
        setLoading(false)

        // Fetch AI brief after data is ready
        await fetchBrief(p, s)
      } catch {
        setLoading(false)
        setBriefLoading(false)
      }
    }
    load()
  }, [supabase, fetchBrief])

  // ── Auto-scroll chat ─────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiTyping])

  // ── Send message ─────────────────────────────────────────
  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || aiTyping) return
    if (!profile?.is_premium && msgCount >= FREE_LIMIT) return

    const userMsg: Msg = { role: 'user', text, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setAiTyping(true)
    setMsgCount(n => n + 1)

    try {
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: { kcal: stats.kcal, workouts: stats.workouts, streak: stats.streak },
        }),
      })
      if (!r.ok) throw new Error('API error')
      const j = await r.json()

      if (j.limitReached) {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: "You've used all 5 free messages today. Upgrade to Premium for unlimited AI coaching. 💪",
          id: Date.now(),
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: j.reply ?? "Let's keep pushing. What's your next move?",
          id: Date.now(),
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "Connection issue — try again in a moment.",
        id: Date.now(),
      }])
    } finally {
      setAiTyping(false)
    }
  }, [input, aiTyping, profile, msgCount, stats])

  // ── Quick prompts ────────────────────────────────────────
  const QUICK = ["What should I eat today?", "Am I on track?", "Motivate me.", "Review my progress."]

  const name    = profile?.full_name?.split(' ')[0] ?? 'Champion'
  const planKey = profile?.fitness_goal ?? 'build_muscle'
  const recs    = RECS[planKey] ?? RECS.build_muscle
  const atLimit = !profile?.is_premium && msgCount >= FREE_LIMIT

  // ════════════════════════════════════════════════════════
  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: FONT,
      color: W, paddingBottom: 32 }}>

      {/* ══════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════ */}
      <div style={{ padding: '52px 20px 0 20px', marginBottom: 20 }}>
        <p style={{ color: G1, fontSize: 12, marginBottom: 4 }}>Your personal</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: W, lineHeight: 1 }}>AI Coach</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 20,
            background: `${P}12`, border: `1px solid ${P}25` }}>
            <motion.div animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#00CC55' }} />
            <span style={{ color: P, fontSize: 11, fontWeight: 600 }}>Active</span>
          </div>
        </div>
        <p style={{ color: G1, fontSize: 13, marginTop: 5 }}>
          Powered by Groq · Personalized for you
        </p>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ══════════════════════════════════════════════════
            AI STATUS CARD
        ══════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ borderRadius: 24, padding: 20, position: 'relative', overflow: 'hidden',
            background: `linear-gradient(135deg, ${P}0A 0%, ${P}04 100%)`,
            border: `1px solid ${P}20` }}>

          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100,
            borderRadius: '50%', background: `radial-gradient(circle, ${P}18, transparent 70%)`,
            pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Pulsing orb */}
            <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
              <PulseRing />
              <div style={{ width: 52, height: 52, borderRadius: '50%',
                background: `${P}18`, border: `1.5px solid ${P}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 1 }}>
                <Zap size={22} color={P} fill={P} />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ color: W, fontWeight: 600, fontSize: 15, marginBottom: 5 }}>
                {loading ? <Sk w={120} h={16} /> : `Coaching ${name}`}
              </div>
              <div style={{ color: G1, fontSize: 12, marginBottom: 10 }}>
                Analyzing your data · Optimizing your plan
              </div>

              {/* Data pills */}
              {!loading && (
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {[
                    { label: `${stats.kcal} kcal`, color: '#FF6B35' },
                    { label: `${stats.workouts} workout${stats.workouts !== 1 ? 's' : ''}`, color: L },
                    { label: `${stats.streak}d streak`, color: P },
                  ].map(pill => (
                    <div key={pill.label}
                      style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                        color: pill.color, background: `${pill.color}12`, border: `1px solid ${pill.color}25` }}>
                      {pill.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            TODAY'S BRIEF
        ══════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20 }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={12} color={P} />
              <span style={{ color: P, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em' }}>
                TODAY&apos;S PLAN
              </span>
            </div>

            {/* Refresh button */}
            <button type="button"
              onClick={() => fetchBrief(profile, stats)}
              disabled={briefLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 10px', borderRadius: 10, background: G2,
                color: G1, fontSize: 11, border: 'none', cursor: briefLoading ? 'default' : 'pointer',
                opacity: briefLoading ? 0.5 : 1 }}>
              <motion.div animate={{ rotate: briefLoading ? 360 : 0 }}
                transition={{ repeat: briefLoading ? Infinity : 0, duration: 1, ease: 'linear' }}>
                <RefreshCw size={11} color={G1} />
              </motion.div>
              Refresh
            </button>
          </div>

          {/* Date — rendered only client-side to avoid hydration error */}
          {dateStr && (
            <div style={{ color: G1, fontSize: 12, marginBottom: 8 }}>{dateStr}</div>
          )}

          {briefLoading
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Sk h={14} /><Sk w="80%" h={14} /><Sk w="60%" h={14} />
              </div>
            : <p style={{ color: '#CCCCCC', fontSize: 14, lineHeight: 1.75, fontWeight: 400, margin: 0 }}>
                {brief || "Your body is ready. Your mind decides. Make today count."}
              </p>
          }
        </motion.div>

        {/* ══════════════════════════════════════════════════
            AI RECOMMENDATIONS
        ══════════════════════════════════════════════════ */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ color: G1, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em' }}>
              AI RECOMMENDATIONS
            </span>
            <span style={{ color: G1, fontSize: 11 }}>Personalized</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recs.map((rec, i) => {
              const Icon = rec.icon
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.07 }}>
                  <Link href={rec.href}
                    style={{ display: 'flex', alignItems: 'center', gap: 14,
                      padding: 16, borderRadius: 20, background: C, border: `1px solid ${BD}`,
                      textDecoration: 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: rec.bg }}>
                      <Icon size={17} color={rec.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: rec.color, fontSize: 10, fontWeight: 600,
                        letterSpacing: '0.1em', marginBottom: 4 }}>
                        {rec.category.toUpperCase()}
                      </div>
                      <div style={{ color: '#CCCCCC', fontSize: 13, lineHeight: 1.5 }}>
                        {rec.action}
                      </div>
                    </div>
                    <ChevronRight size={14} color={G2} style={{ flexShrink: 0 }} />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            CHAT
        ══════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BD}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: W, fontWeight: 600, fontSize: 14 }}>Ask Your Coach</div>
              <div style={{ color: G1, fontSize: 11, marginTop: 2 }}>
                {profile?.is_premium
                  ? '✨ Unlimited · Premium'
                  : `${Math.max(FREE_LIMIT - msgCount, 0)} free messages left today`}
              </div>
            </div>
            {!profile?.is_premium && (
              <Link href="/profile?upgrade=1"
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
                  borderRadius: 10, background: `${L}12`, border: `1px solid ${L}30`,
                  color: L, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                <Zap size={11} fill={L} /> Upgrade
              </Link>
            )}
          </div>

          {/* Messages */}
          <div style={{ padding: '16px 14px 8px', maxHeight: 300, overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Default greeting */}
            {messages.length === 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ maxWidth: '85%', padding: '12px 14px', borderRadius: 18,
                  borderBottomLeftRadius: 4, background: '#161616' }}>
                  <p style={{ color: '#CCCCCC', fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                    {greetStr ? `${greetStr}, ` : ''}{name} 👋 I&apos;ve looked at your data.
                    What do you want to work on today?
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28 }}
                  style={{ display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%', padding: '12px 14px', borderRadius: 18,
                    borderBottomRightRadius: msg.role === 'user' ? 4 : 18,
                    borderBottomLeftRadius:  msg.role === 'ai'   ? 4 : 18,
                    background: msg.role === 'user' ? `${P}20` : '#161616',
                    border: msg.role === 'user' ? `1px solid ${P}30` : 'none',
                  }}>
                    <p style={{ color: msg.role === 'user' ? '#DDCCFF' : '#CCCCCC',
                      fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                      {msg.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {aiTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TypingDots />
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts */}
          {messages.length === 0 && (
            <div style={{ padding: '0 12px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {QUICK.map(q => (
                <button key={q} type="button"
                  onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50) }}
                  style={{ padding: '6px 10px', borderRadius: 12, background: G2,
                    color: '#999', fontSize: 11, fontWeight: 500,
                    border: 'none', cursor: 'pointer', fontFamily: FONT }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Premium gate */}
          {atLimit && (
            <div style={{ margin: '0 12px 12px', padding: '12px 16px', borderRadius: 16,
              background: `${L}08`, border: `1px solid ${L}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={13} color={L} />
                <span style={{ color: '#ccc', fontSize: 12 }}>Daily limit reached</span>
              </div>
              <Link href="/profile?upgrade=1"
                style={{ padding: '6px 12px', borderRadius: 10, background: L,
                  color: '#000', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                Upgrade
              </Link>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '8px 12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={atLimit ? 'Upgrade to continue...' : 'Ask anything...'}
              disabled={atLimit || aiTyping}
              style={{ flex: 1, background: G2, border: 'none',
                borderRadius: 14, padding: '12px 14px',
                color: W, fontSize: 13, outline: 'none',
                opacity: atLimit ? 0.5 : 1, fontFamily: FONT }} />
            <button type="button" onClick={send}
              disabled={!input.trim() || aiTyping || atLimit}
              style={{ width: 44, height: 44, borderRadius: 14, border: 'none',
                background: input.trim() && !aiTyping && !atLimit ? P : '#1e1e1e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !aiTyping && !atLimit ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s', flexShrink: 0 }}>
              <Send size={16} color={input.trim() && !aiTyping && !atLimit ? '#fff' : '#444'} />
            </button>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            PREMIUM CTA — free users only
        ══════════════════════════════════════════════════ */}
        {!loading && !profile?.is_premium && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <Link href="/profile?upgrade=1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 20px', borderRadius: 24,
                background: `linear-gradient(135deg, ${L}09 0%, ${L}04 100%)`,
                border: `1px solid ${L}20`, textDecoration: 'none' }}>
              <div>
                <div style={{ color: L, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  Unlock Full AI Coaching
                </div>
                <div style={{ color: G1, fontSize: 12 }}>
                  Unlimited chat · Advanced insights · 199 BDT/mo
                </div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: L, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#000" fill="#000" />
              </div>
            </Link>
          </motion.div>
        )}

      </div>
    </div>
  )
}