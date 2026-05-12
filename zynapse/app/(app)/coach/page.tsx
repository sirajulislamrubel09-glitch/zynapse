'use client'

// ============================================================
//  ZYNAPSE — AI COACH PAGE (REDESIGNED)
//  Matches the provided design: dark, lime green, premium
// ============================================================

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Zap, ChevronRight, Dumbbell, Send,
  Apple, Moon, Heart, Lock, Sparkles, RefreshCw, Settings,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const L    = '#AAFF00'
const P    = '#A78BFA'
const BG   = '#0A0A0A'
const C    = '#111111'
const BD   = '#1C1C1C'
const W    = '#FFFFFF'
const G1   = '#666666'
const G2   = '#252525'
const FONT = "'Syne','Inter',sans-serif"

type Msg  = { role: 'user' | 'ai'; text: string; id: number }
type Prof = {
  full_name: string
  fitness_goal: string
  daily_calorie_goal: number
  is_premium: boolean
}

const RECS: Record<string, {
  icon: typeof Dumbbell; color: string; bg: string
  category: string; action: string; href: string
}[]> = {
  build_muscle: [
    { icon: Dumbbell, color: L,         bg: `${L}12`,                 category: 'Workout',   action: 'Push Day (Chest Focus) — 4×8 Bench Press to start.',          href: '/workout' },
    { icon: Apple,    color: '#FF6B35', bg: 'rgba(255,107,53,0.1)',   category: 'Nutrition', action: 'Increase protein intake by 20g. Add chicken breast at lunch.',  href: '/food'    },
    { icon: Moon,     color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',   category: 'Recovery',  action: 'Aim for 7–8h sleep tonight. Muscle repairs while you rest.',    href: '/profile' },
    { icon: Heart,    color: P,         bg: `${P}12`,                 category: 'Mindset',   action: '10 min meditation before bed. Discipline builds in silence.',   href: '/coach'   },
  ],
  lose_fat: [
    { icon: Dumbbell, color: L,         bg: `${L}12`,                 category: 'Workout',   action: 'HIIT session — 20 min. Heart rate 75–85% max.',                href: '/workout' },
    { icon: Apple,    color: '#FF6B35', bg: 'rgba(255,107,53,0.1)',   category: 'Nutrition', action: 'Stay in deficit. Prioritize protein — 150g minimum today.',     href: '/food'    },
    { icon: Moon,     color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',   category: 'Recovery',  action: 'Quality sleep cuts cortisol. Aim for 8 hours tonight.',         href: '/profile' },
    { icon: Heart,    color: P,         bg: `${P}12`,                 category: 'Mindset',   action: 'Progress over perfection. One meal does not break a diet.',     href: '/coach'   },
  ],
  lean_bulk: [
    { icon: Dumbbell, color: L,         bg: `${L}12`,                 category: 'Workout',   action: 'Upper body A — progressive overload on pressing movements.',    href: '/workout' },
    { icon: Apple,    color: '#FF6B35', bg: 'rgba(255,107,53,0.1)',   category: 'Nutrition', action: 'Slight surplus today — 200 kcal over maintenance.',             href: '/food'    },
    { icon: Moon,     color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',   category: 'Recovery',  action: 'Stretch hip flexors tonight. Mobility equals better lifts.',    href: '/profile' },
    { icon: Heart,    color: P,         bg: `${P}12`,                 category: 'Mindset',   action: 'Trust the process. Lean bulk takes months, not weeks.',         href: '/coach'   },
  ],
  athletic_body: [
    { icon: Dumbbell, color: L,         bg: `${L}12`,                 category: 'Workout',   action: 'Power session — box jumps, cleans, sprint intervals.',          href: '/workout' },
    { icon: Apple,    color: '#FF6B35', bg: 'rgba(255,107,53,0.1)',   category: 'Nutrition', action: 'Carb-load before training. Performance needs fuel.',             href: '/food'    },
    { icon: Moon,     color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',   category: 'Recovery',  action: 'Cold shower post-session. Reduces inflammation fast.',           href: '/profile' },
    { icon: Heart,    color: P,         bg: `${P}12`,                 category: 'Mindset',   action: 'Champions train when they do not feel like it. Go.',            href: '/coach'   },
  ],
  maintain_fitness: [
    { icon: Dumbbell, color: L,         bg: `${L}12`,                 category: 'Workout',   action: 'Full body session — moderate intensity, all movement patterns.', href: '/workout' },
    { icon: Apple,    color: '#FF6B35', bg: 'rgba(255,107,53,0.1)',   category: 'Nutrition', action: 'Maintenance calories. Balanced macros across all meals.',        href: '/food'    },
    { icon: Moon,     color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',   category: 'Recovery',  action: 'One full rest day per week. Sustainability is the goal.',        href: '/profile' },
    { icon: Heart,    color: P,         bg: `${P}12`,                 category: 'Mindset',   action: 'Consistency over intensity. Show up every single day.',          href: '/coach'   },
  ],
}

function TypingDots() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '12px 16px', borderRadius: 18, borderBottomLeftRadius: 4,
      background: '#161616', width: 'fit-content',
    }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: P }}
        />
      ))}
    </div>
  )
}

function PulseRing() {
  return (
    <>
      {[0, 1].map(i => (
        <motion.div key={i}
          style={{
            position: 'absolute', borderRadius: '50%',
            border: `1px solid ${L}`,
            width: 56 + i * 20, height: 56 + i * 20,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0, 0.4, 0], scale: [0.9, 1.05, 1.05] }}
          transition={{ repeat: Infinity, duration: 2.8, delay: i * 0.7, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

function Sk({ w = '100%', h = 14 }: { w?: string | number; h?: number }) {
  return (
    <motion.div
      animate={{ opacity: [0.12, 0.28, 0.12] }}
      transition={{ repeat: Infinity, duration: 1.8 }}
      style={{ width: w, height: h, borderRadius: 6, background: '#1e1e1e' }}
    />
  )
}

export default function CoachPage() {
  const supabase   = createClient()
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  const [loading, setLoading]           = useState(true)
  const [profile, setProfile]           = useState<Prof | null>(null)
  const [stats, setStats]               = useState({ kcal: 0, workouts: 0, streak: 0 })
  const [brief, setBrief]               = useState('')
  const [briefLoading, setBriefLoading] = useState(true)
  const [messages, setMessages]         = useState<Msg[]>([])
  const [input, setInput]               = useState('')
  const [aiTyping, setAiTyping]         = useState(false)
  const [msgCount, setMsgCount]         = useState(0)
  const [dateStr, setDateStr]           = useState('')
  const [greetStr, setGreetStr]         = useState('')
  const FREE_LIMIT = 5

  useEffect(() => {
    const now = new Date()
    const h   = now.getHours()
    setDateStr(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))
    setGreetStr(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening')
  }, [])

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
          name:             p?.full_name?.split(' ')[0] ?? 'Champion',
          goal:             p?.fitness_goal ?? 'build_muscle',
          caloriesConsumed: s.kcal,
          calorieGoal:      p?.daily_calorie_goal ?? 2000,
          workoutsToday:    s.workouts,
          detoxStreak:      s.streak,
        }),
      })
      if (r.ok) {
        const j = await r.json()
        setBrief(j.insight ?? '')
      }
    } catch { /* use fallback */ }
    finally { setBriefLoading(false) }
  }, [])

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

        const p = pR.data as Prof | null
        const m = mR.data ?? []
        const s = {
          kcal:     m.reduce((acc, x) => acc + (x.calories ?? 0), 0),
          workouts: (wR.data ?? []).length,
          streak:   dR.data?.[0]?.streak_current ?? 0,
        }
        setProfile(p)
        setStats(s)
        setLoading(false)
        await fetchBrief(p, s)
      } catch {
        setLoading(false)
        setBriefLoading(false)
      }
    }
    load()
  }, [supabase, fetchBrief])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiTyping])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || aiTyping) return
    if (!profile?.is_premium && msgCount >= FREE_LIMIT) return

    const userMsg: Msg = { role: 'user', text, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setAiTyping(true)
    setMsgCount(n => n + 1)

    // Build history for context
    const history = messages.slice(-6).map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.text,
    }))

    try {
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: { kcal: stats.kcal, workouts: stats.workouts, streak: stats.streak },
          history,
        }),
      })
      if (!r.ok) throw new Error('API error')
      const j = await r.json()

      if (j.limitReached) {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: "You've used all 5 free messages today. Upgrade to Premium for unlimited AI coaching.",
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
        text: 'Connection issue — try again in a moment.',
        id: Date.now(),
      }])
    } finally {
      setAiTyping(false)
    }
  }, [input, aiTyping, profile, msgCount, stats, messages])

  const QUICK = ['What should I eat today?', 'Am I on track?', 'Motivate me.', 'Review my progress.']

  const name    = profile?.full_name?.split(' ')[0] ?? 'Champion'
  const planKey = profile?.fitness_goal ?? 'build_muscle'
  const recs    = RECS[planKey] ?? RECS.build_muscle
  const atLimit = !profile?.is_premium && msgCount >= FREE_LIMIT

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: FONT, color: W, paddingBottom: 32 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ padding: '52px 20px 0 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: G1, fontSize: 12, marginBottom: 4, letterSpacing: '0.05em' }}>
              Your personal performance coach
            </p>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: W, lineHeight: 1 }}>AI Coach</h1>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: G2, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Settings size={18} color={G1} />
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ── AI Status Card ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          style={{
            borderRadius: 24, padding: '20px 20px',
            background: `linear-gradient(135deg, #161616 0%, #111 100%)`,
            border: `1px solid ${BD}`, position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Glow */}
          <div style={{
            position: 'absolute', top: -40, right: -20, width: 140, height: 140,
            borderRadius: '50%', background: `radial-gradient(circle, ${L}10, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Greeting */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              {greetStr && (
                <span style={{ color: W, fontWeight: 700, fontSize: 18 }}>
                  {greetStr}, {name} 👋
                </span>
              )}
            </div>
            <p style={{ color: '#888', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
              I&apos;m here to help you become the best version of yourself.
            </p>
          </div>

          {/* Orb + pills row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
              <PulseRing />
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: `${L}15`, border: `1.5px solid ${L}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 1,
              }}>
                <Zap size={22} color={L} fill={L} />
              </div>
            </div>

            {!loading && (
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {[
                  { label: `${stats.kcal} kcal`, color: '#FF6B35' },
                  { label: `${stats.workouts} workout${stats.workouts !== 1 ? 's' : ''}`, color: L },
                  { label: `${stats.streak}d streak`, color: P },
                ].map(pill => (
                  <div key={pill.label} style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                    color: pill.color, background: `${pill.color}12`, border: `1px solid ${pill.color}25`,
                  }}>
                    {pill.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active indicator */}
          <div style={{
            position: 'absolute', top: 20, right: 20,
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 20,
            background: 'rgba(0,204,85,0.08)', border: '1px solid rgba(0,204,85,0.2)',
          }}>
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#00CC55' }}
            />
            <span style={{ color: '#00CC55', fontSize: 10, fontWeight: 600 }}>Online</span>
          </div>
        </motion.div>

        {/* ── Today's Plan ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={12} color={L} />
              <span style={{ color: L, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>
                TODAY&apos;S PLAN
              </span>
            </div>
            <button
              type="button"
              onClick={() => fetchBrief(profile, stats)}
              disabled={briefLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 10px', borderRadius: 10, background: G2,
                color: G1, fontSize: 11, border: 'none',
                cursor: briefLoading ? 'default' : 'pointer', opacity: briefLoading ? 0.5 : 1,
              }}
            >
              <motion.div
                animate={{ rotate: briefLoading ? 360 : 0 }}
                transition={{ repeat: briefLoading ? Infinity : 0, duration: 0.8, ease: 'linear' }}
              >
                <RefreshCw size={11} color={G1} />
              </motion.div>
              Refresh
            </button>
          </div>

          {dateStr && (
            <div style={{ color: G1, fontSize: 12, marginBottom: 10 }}>{dateStr}</div>
          )}

          {briefLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Sk h={14} /><Sk w="80%" h={14} /><Sk w="55%" h={14} />
            </div>
          ) : (
            <p style={{ color: '#CCCCCC', fontSize: 14, lineHeight: 1.8, fontWeight: 400, margin: 0 }}>
              {brief || 'Your body is ready. Your mind decides. Make today count.'}
            </p>
          )}
        </motion.div>

        {/* ── AI Recommendations ──────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: G1, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>
              TODAY&apos;S PLAN
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recs.map((rec, i) => {
              const Icon = rec.icon
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 + i * 0.07 }}>
                  <Link href={rec.href} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 20,
                    background: C, border: `1px solid ${BD}`,
                    textDecoration: 'none',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: rec.bg,
                    }}>
                      <Icon size={17} color={rec.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: rec.color, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 3 }}>
                        {rec.category.toUpperCase()}
                      </div>
                      <div style={{ color: '#BBBBBB', fontSize: 13, lineHeight: 1.5 }}>
                        {rec.action}
                      </div>
                    </div>
                    <ChevronRight size={14} color="#333" style={{ flexShrink: 0 }} />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Coach Insight ───────────────────────────────── */}
        {(brief || briefLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{
              background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20,
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: -20, right: -20, width: 80, height: 80,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${L}08, transparent 70%)`,
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, background: `${L}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={13} color={L} fill={L} />
              </div>
              <span style={{ color: G1, fontSize: 11, fontWeight: 600 }}>Coach Insight</span>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                style={{
                  marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%',
                  background: L,
                }}
              />
            </div>
            {briefLoading ? (
              <Sk w="70%" h={13} />
            ) : (
              <p style={{ color: '#CCCCCC', fontSize: 14, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                &ldquo;{brief || 'Consistency is the multiplier. Discipline today, freedom tomorrow.'}&rdquo;
              </p>
            )}
          </motion.div>
        )}

        {/* ── Chat ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, overflow: 'hidden' }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: `1px solid ${BD}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ color: W, fontWeight: 700, fontSize: 14 }}>Ask Coach</div>
              <div style={{ color: G1, fontSize: 11, marginTop: 2 }}>
                {profile?.is_premium
                  ? '✨ Unlimited · Premium'
                  : `${Math.max(FREE_LIMIT - msgCount, 0)} free messages left today`}
              </div>
            </div>
            {!profile?.is_premium && (
              <Link href="/profile?upgrade=1" style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 12px', borderRadius: 10,
                background: `${L}12`, border: `1px solid ${L}30`,
                color: L, fontSize: 11, fontWeight: 700, textDecoration: 'none',
              }}>
                <Zap size={11} fill={L} /> Upgrade
              </Link>
            )}
          </div>

          {/* Messages */}
          <div style={{
            padding: '16px 14px 8px',
            maxHeight: 320, overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  maxWidth: '88%', padding: '12px 16px', borderRadius: 18,
                  borderBottomLeftRadius: 4, background: '#161616',
                }}>
                  <p style={{ color: '#CCCCCC', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                    Ask me anything about fitness, nutrition, or mindset. I&apos;ve looked at your data — let&apos;s get to work.
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    maxWidth: '88%', padding: '12px 16px', borderRadius: 18,
                    borderBottomRightRadius: msg.role === 'user' ? 4 : 18,
                    borderBottomLeftRadius:  msg.role === 'ai'   ? 4 : 18,
                    background: msg.role === 'user' ? `${L}15` : '#161616',
                    border: msg.role === 'user' ? `1px solid ${L}25` : 'none',
                  }}>
                    <p style={{
                      color: msg.role === 'user' ? '#D4F79B' : '#CCCCCC',
                      fontSize: 13, lineHeight: 1.7, margin: 0,
                    }}>
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
                  style={{
                    padding: '7px 12px', borderRadius: 12,
                    background: G2, color: '#888', fontSize: 11, fontWeight: 500,
                    border: 'none', cursor: 'pointer', fontFamily: FONT,
                  }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Limit gate */}
          {atLimit && (
            <div style={{
              margin: '0 12px 12px', padding: '12px 16px', borderRadius: 16,
              background: `${L}07`, border: `1px solid ${L}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={13} color={L} />
                <span style={{ color: '#aaa', fontSize: 12 }}>Daily limit reached</span>
              </div>
              <Link href="/profile?upgrade=1" style={{
                padding: '6px 14px', borderRadius: 10, background: L,
                color: '#000', fontSize: 11, fontWeight: 700, textDecoration: 'none',
              }}>
                Upgrade
              </Link>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '8px 12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={atLimit ? 'Upgrade to continue...' : 'Type your question...'}
              disabled={atLimit || aiTyping}
              style={{
                flex: 1, background: G2, border: 'none',
                borderRadius: 14, padding: '12px 16px',
                color: W, fontSize: 13, outline: 'none',
                opacity: atLimit ? 0.5 : 1, fontFamily: FONT,
              }}
            />
            <motion.button
              type="button"
              onClick={send}
              disabled={!input.trim() || aiTyping || atLimit}
              whileTap={{ scale: 0.92 }}
              style={{
                width: 46, height: 46, borderRadius: 14, border: 'none',
                background: input.trim() && !aiTyping && !atLimit ? L : '#1C1C1C',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !aiTyping && !atLimit ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <Send size={16} color={input.trim() && !aiTyping && !atLimit ? '#000' : '#444'} />
            </motion.button>
          </div>
        </motion.div>

        {/* ── Premium CTA ─────────────────────────────────── */}
        {!loading && !profile?.is_premium && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <Link href="/profile?upgrade=1" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 20px', borderRadius: 24,
              background: `linear-gradient(135deg, ${L}08, ${L}03)`,
              border: `1px solid ${L}18`, textDecoration: 'none',
            }}>
              <div>
                <div style={{ color: L, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  Unlock Full AI Coaching
                </div>
                <div style={{ color: G1, fontSize: 12 }}>
                  Unlimited chat · Advanced insights · Premium
                </div>
              </div>
              <div style={{
                width: 42, height: 42, borderRadius: 13, background: L,
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={18} color="#000" fill="#000" />
              </div>
            </Link>
          </motion.div>
        )}

      </div>
    </div>
  )
}
