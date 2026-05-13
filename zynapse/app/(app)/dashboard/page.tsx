'use client'

// ============================================================
//  ZYNAPSE — DASHBOARD (MINIMAL & CLASSY)
//  File: app/(app)/dashboard/page.tsx
// ============================================================

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Bell, Zap, Flame, Dumbbell, Droplets,
  ChevronRight, Play, Pause, Check,
  Brain, Plus,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─── Tokens — strict minimal palette ─────────────────────────
const L    = '#AAFF00'
const BG   = '#080808'
const C    = '#0D0D0D'
const BD   = '#181818'
const W    = '#FFFFFF'
const G1   = '#888888'   // secondary text
const G2   = '#333333'   // muted / track

// ─── Types ───────────────────────────────────────────────────
type Profile = {
  full_name: string
  fitness_goal: string
  daily_calorie_goal: number
  daily_protein_goal_g: number
  daily_carb_goal_g: number
  daily_fat_goal_g: number
  is_premium: boolean
}
type Stats = {
  kcal: number; protein: number; carbs: number; fat: number
  workouts: number; streak: number; focusMins: number
}

// ─── Workout library by goal ──────────────────────────────────
const PLANS: Record<string, { label: string; name: string; muscles: string }[]> = {
  build_muscle:     [
    { label: 'Today',     name: 'Push Day',  muscles: 'Chest · Shoulders · Triceps' },
    { label: 'Tomorrow',  name: 'Pull Day',  muscles: 'Back · Biceps'               },
    { label: 'Wed',       name: 'Leg Day',   muscles: 'Quads · Hamstrings'          },
    { label: 'Thu',       name: 'Recovery',  muscles: 'Mobility · Stretching'       },
  ],
  lose_fat:         [
    { label: 'Today',     name: 'HIIT',      muscles: 'Full Body · Cardio'          },
    { label: 'Tomorrow',  name: 'Core',      muscles: 'Abs · Obliques'              },
    { label: 'Wed',       name: 'Cardio',    muscles: 'Steady State Run'            },
    { label: 'Thu',       name: 'Rest',      muscles: 'Active Recovery'             },
  ],
  lean_bulk:        [
    { label: 'Today',     name: 'Upper A',   muscles: 'Chest · Back · Arms'         },
    { label: 'Tomorrow',  name: 'Lower A',   muscles: 'Quads · Glutes · Calves'     },
    { label: 'Wed',       name: 'Upper B',   muscles: 'Shoulders · Arms'            },
    { label: 'Thu',       name: 'Lower B',   muscles: 'Hamstrings · Glutes'         },
  ],
  athletic_body:    [
    { label: 'Today',     name: 'Power',     muscles: 'Explosive Strength'          },
    { label: 'Tomorrow',  name: 'Speed',     muscles: 'Agility · Sprint'            },
    { label: 'Wed',       name: 'Endurance', muscles: 'Cardio · VO2 Max'            },
    { label: 'Thu',       name: 'Mobility',  muscles: 'Flexibility · Balance'       },
  ],
  maintain_fitness: [
    { label: 'Today',     name: 'Full Body', muscles: 'Balanced Strength'           },
    { label: 'Tomorrow',  name: 'Cardio',    muscles: 'Heart Health · Endurance'    },
    { label: 'Wed',       name: 'Strength',  muscles: 'Core · Stability'            },
    { label: 'Thu',       name: 'Flex',      muscles: 'Yoga · Stretching'           },
  ],
}

// ─── Calorie ring — clean SVG ────────────────────────────────
function Ring({ pct }: { pct: number }) {
  const S = 200, sw = 10, r = (S - sw) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={S} height={S} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={S/2} cy={S/2} r={r} fill="none" stroke={G2} strokeWidth={sw} />
      <motion.circle cx={S/2} cy={S/2} r={r} fill="none" stroke={L} strokeWidth={sw}
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - Math.min(pct, 1)) }}
        transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </svg>
  )
}

// ─── Thin progress bar ────────────────────────────────────────
function Bar({ pct, color = L }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 3, borderRadius: 99, background: G2, overflow: 'hidden' }}>
      <motion.div style={{ height: '100%', borderRadius: 99, background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────
function Sk({ w = '100%', h = 14 }: { w?: string | number; h?: number }) {
  return (
    <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }}
      transition={{ repeat: Infinity, duration: 1.6 }}
      style={{ width: w, height: h, borderRadius: 6, background: '#1c1c1c' }} />
  )
}

// ─── Label ───────────────────────────────────────────────────
function Label({ children }: { children: string }) {
  return (
    <span style={{ color: G1, fontSize: 10, fontWeight: 600,
      letterSpacing: '0.12em', textTransform: 'uppercase' }}>
      {children}
    </span>
  )
}

// ════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const supabase = createClient()
  const [loading, setLoading]   = useState(true)
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [stats, setStats]       = useState<Stats>({ kcal: 0, protein: 0, carbs: 0, fat: 0, workouts: 0, streak: 0, focusMins: 0 })
  const [insight, setInsight]   = useState('')
  const [focusOn, setFocusOn]   = useState(false)
  const [secs, setSecs]         = useState(25 * 60)
  const timer                   = useRef<ReturnType<typeof setInterval> | null>(null)
  // FIX: Hydration — date strings client-only
  const [greetStr, setGreetStr] = useState('')
  const [dateStr, setDateStr]   = useState('')

  useEffect(() => {
    const now = new Date()
    const h   = now.getHours()
    const gStr = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'
    const dStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    requestAnimationFrame(() => {
      setGreetStr(gStr)
      setDateStr(dStr)
    })
  }, [])

  // ── Timer ────────────────────────────────────────────────
  useEffect(() => {
    if (focusOn) {
      timer.current = setInterval(() => setSecs(s => {
        if (s <= 1) { clearInterval(timer.current!); setFocusOn(false); return 0 }
        return s - 1
      }), 1000)
    } else {
      if (timer.current) clearInterval(timer.current)
    }
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [focusOn])

  const clock = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`

  // ── Fetch ────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date().toISOString().split('T')[0]

        const [pR, mR, wR, dR, fR] = await Promise.all([
          supabase.from('profiles').select('full_name,fitness_goal,daily_calorie_goal,daily_protein_goal_g,daily_carb_goal_g,daily_fat_goal_g,is_premium').eq('id', user.id).single(),
          supabase.from('meals').select('calories,protein_g,carbs_g,fat_g').eq('user_id', user.id).gte('logged_at', `${today}T00:00:00`),
          supabase.from('workout_logs').select('id').eq('user_id', user.id).gte('created_at', `${today}T00:00:00`),
          supabase.from('detox_logs').select('streak_current').eq('user_id', user.id).eq('status', 'active').order('streak_current', { ascending: false }).limit(1),
          supabase.from('focus_sessions').select('duration_mins').eq('user_id', user.id).eq('completed', true).gte('created_at', `${today}T00:00:00`),
        ])

        const p   = pR.data as Profile | null
        const m   = mR.data ?? []
        setProfile(p)
        setStats({
          kcal:      m.reduce((s, x) => s + (x.calories  ?? 0), 0),
          protein:   m.reduce((s, x) => s + (x.protein_g ?? 0), 0),
          carbs:     m.reduce((s, x) => s + (x.carbs_g   ?? 0), 0),
          fat:       m.reduce((s, x) => s + (x.fat_g     ?? 0), 0),
          workouts:  (wR.data ?? []).length,
          streak:    dR.data?.[0]?.streak_current ?? 0,
          focusMins: (fR.data ?? []).reduce((s, x) => s + (x.duration_mins ?? 0), 0),
        })

        // AI insight
        try {
          const r = await fetch('/api/ai/insight', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: p?.full_name?.split(' ')[0],
              goal: p?.fitness_goal,
              caloriesConsumed: m.reduce((s, x) => s + (x.calories ?? 0), 0),
              calorieGoal: p?.daily_calorie_goal,
              workoutsToday: (wR.data ?? []).length,
              detoxStreak: dR.data?.[0]?.streak_current ?? 0,
            }),
          })
          if (r.ok) { const j = await r.json(); if (j.insight) setInsight(j.insight) }
        } catch {
          setInsight('Consistency is the only strategy that always works.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  // ── Computed ─────────────────────────────────────────────
  const name      = profile?.full_name?.split(' ')[0] ?? 'Champion'
  const calGoal   = profile?.daily_calorie_goal ?? 2000
  const proGoal   = profile?.daily_protein_goal_g ?? 150
  const carbGoal  = profile?.daily_carb_goal_g ?? 250
  const fatGoal   = profile?.daily_fat_goal_g ?? 65
  const calPct    = calGoal > 0 ? stats.kcal / calGoal : 0
  const remaining = Math.max(calGoal - stats.kcal, 0)
  const planKey   = profile?.fitness_goal ?? 'build_muscle'
  const plan      = PLANS[planKey] ?? PLANS.build_muscle
  const score     = Math.min(
    Math.round(Math.min(calPct, 1) * 30 + Math.min(stats.workouts, 1) * 30 +
      Math.min(stats.streak / 7, 1) * 20 + Math.min(stats.focusMins / 60, 1) * 20), 100
  )

  // ════════════════════════════════════════════════════════
  return (
    <div style={{ background: BG, minHeight: '100vh', color: W,
      fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", paddingBottom: 32 }}>

      {/* ═══════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: '52px 20px 0' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {/* Left */}
          <div>
            {greetStr && <p style={{ color: G1, fontSize: 13, marginBottom: 4 }}>{greetStr},</p>}
            {loading
              ? <Sk w={130} h={32} />
              : <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h1 style={{ fontSize: 30, fontWeight: 900, color: W, lineHeight: 1 }}>{name}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap size={22} color={L} fill={L} />
                    {profile?.is_premium && (
                      <div style={{ padding: '3px 6px', borderRadius: 6, background: L, color: '#000', fontSize: 9, fontWeight: 900 }}>PRO</div>
                    )}
                  </div>
                </div>
            }
            {dateStr && <p style={{ color: G2, fontSize: 11, marginTop: 6 }}>{dateStr}</p>}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Streak */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', borderRadius: 14, background: C, border: `1px solid ${BD}` }}>
              <Flame size={14} color="#FF6B35" fill="#FF6B35" />
              <span style={{ color: W, fontWeight: 800, fontSize: 15 }}>
                {loading ? '—' : stats.streak}
              </span>
            </div>
            {/* Avatar */}
            <div style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%',
              background: `${L}18`, border: `1.5px solid ${L}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: L, fontWeight: 900, fontSize: 16 }}>{name[0]}</span>
              <div style={{ position: 'absolute', bottom: -1, right: -1, width: 11, height: 11,
                borderRadius: '50%', background: '#00CC55', border: `2px solid ${BG}` }} />
            </div>
            {/* Bell */}
            <button type="button"
              style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: C, border: `1px solid ${BD}`, cursor: 'pointer' }}>
              <Bell size={15} color={G1} />
            </button>
          </div>
        </div>
      </motion.div>

      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ═══════════════════════════════════════════════════
            AI BANNER — one clean line
        ═══════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <Link href="/coach" style={{ display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '12px 16px', borderRadius: 16,
            background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)',
            textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10,
                background: 'rgba(0,212,255,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={15} color="#00D4FF" />
              </div>
              <div>
                <span style={{ color: '#00D4FF', fontWeight: 700, fontSize: 12 }}>ZYNAPSE AI</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00CC55' }} />
                  <span style={{ color: G1, fontSize: 11 }}>Online · Ready to optimize you</span>
                </div>
              </div>
            </div>
            <ChevronRight size={15} color={G2} />
          </Link>
        </motion.div>

        {/* ═══════════════════════════════════════════════════
            CALORIE HERO — ring + macros
        ═══════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20 }}>

          {/* Label row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Label>Calories</Label>
            {!loading && remaining > 0 && (
              <span style={{ color: G1, fontSize: 11 }}>
                {remaining.toLocaleString()} kcal remaining
              </span>
            )}
            {!loading && remaining === 0 && (
              <span style={{ color: L, fontSize: 11, fontWeight: 600 }}>Goal reached 🎯</span>
            )}
          </div>

          {/* Ring centered */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 24 }}>
            {loading
              ? <div style={{ width: 200, height: 200, borderRadius: '50%', background: '#161616' }} />
              : <Ring pct={calPct} />
            }
            {/* Center overlay */}
            {!loading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 34, fontWeight: 900, color: W, lineHeight: 1 }}>
                  {stats.kcal.toLocaleString()}
                </span>
                <span style={{ color: G1, fontSize: 12, marginTop: 4 }}>
                  of {calGoal.toLocaleString()} kcal
                </span>
              </div>
            )}
          </div>

          {/* Macro bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14,
            paddingTop: 20, borderTop: `1px solid ${BD}` }}>
            {[
              { label: 'Protein', val: stats.protein, goal: proGoal,  color: L         },
              { label: 'Carbs',   val: stats.carbs,   goal: carbGoal, color: '#00D4FF' },
              { label: 'Fat',     val: stats.fat,     goal: fatGoal,  color: '#888'    },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: G1, fontSize: 12 }}>{m.label}</span>
                  <span style={{ color: W, fontSize: 12, fontWeight: 600 }}>
                    {loading ? '—' : Math.round(m.val)}g
                    <span style={{ color: G2 }}> / {m.goal}g</span>
                  </span>
                </div>
                {loading
                  ? <div style={{ height: 3, borderRadius: 99, background: G2 }} />
                  : <Bar pct={(m.val / m.goal) * 100} color={m.color} />
                }
              </div>
            ))}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════
            STATS ROW — 3 equal cards
        ═══════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { icon: Dumbbell,  color: L,        label: 'Workouts',  val: loading ? '—' : `${stats.workouts}`,      sub: 'sessions'  },
            { icon: Droplets,  color: '#00D4FF', label: 'Water',     val: '2.4L',                                    sub: 'of 3.0L'   },
            { icon: Brain,     color: '#A78BFA', label: 'Focus',     val: loading ? '—' : `${stats.focusMins}m`,    sub: 'today'     },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label}
                style={{ background: C, border: `1px solid ${BD}`, borderRadius: 18, padding: 16 }}>
                <Icon size={16} color={s.color} style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 20, fontWeight: 800, color: W, lineHeight: 1 }}>{s.val}</div>
                <div style={{ color: G1, fontSize: 10, marginTop: 4 }}>{s.label}</div>
                <div style={{ color: G2, fontSize: 10, marginTop: 1 }}>{s.sub}</div>
              </div>
            )
          })}
        </motion.div>

        {/* ═══════════════════════════════════════════════════
            AI INSIGHT — clean quote, no decoration
        ═══════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Zap size={12} color={L} fill={L} />
            <Label>AI Coach Insight</Label>
          </div>
          {loading || !insight
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Sk h={14} /><Sk w="70%" h={14} />
              </div>
            : <p style={{ color: '#CCCCCC', fontSize: 14, lineHeight: 1.7, fontWeight: 400, margin: 0 }}>
                {insight}
              </p>
          }
          <Link href="/coach"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 16,
              color: G1, fontSize: 12, textDecoration: 'none' }}>
            View full plan <ChevronRight size={13} />
          </Link>
        </motion.div>

        {/* ═══════════════════════════════════════════════════
            WORKOUT PLAN — clean list
        ═══════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Label>Workout Plan</Label>
            <Link href="/workout"
              style={{ display: 'flex', alignItems: 'center', gap: 2,
                color: G1, fontSize: 12, textDecoration: 'none' }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {/* Plan list */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {plan.map((w, i) => {
              const isToday = i === 0
              return (
                <div key={i}
                  style={{ display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 0',
                    borderBottom: i < plan.length - 1 ? `1px solid ${BD}` : 'none' }}>

                  {/* Day label */}
                  <span style={{ color: isToday ? L : G2, fontSize: 11, fontWeight: 600,
                    width: 52, flexShrink: 0 }}>
                    {w.label}
                  </span>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: isToday ? W : '#666', fontWeight: isToday ? 700 : 500,
                      fontSize: 14, marginBottom: 2 }}>
                      {w.name}
                    </div>
                    <div style={{ color: G2, fontSize: 11 }}>{w.muscles}</div>
                  </div>

                  {/* Action */}
                  {isToday
                    ? <Link href="/workout"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 32, height: 32, borderRadius: 10, background: L,
                          textDecoration: 'none' }}>
                        <Play size={13} color="#000" fill="#000" />
                      </Link>
                    : <div style={{ width: 32, height: 32, borderRadius: 10,
                        border: `1px solid ${BD}`, display: 'flex', alignItems: 'center',
                        justifyContent: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: G2 }} />
                      </div>
                  }
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════
            DISCIPLINE SCORE
        ═══════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20 }}>

          <Label>Discipline Score</Label>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            marginTop: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 52, fontWeight: 900, color: W, lineHeight: 1 }}>
                {loading ? '—' : score}
              </span>
              <span style={{ color: G2, fontSize: 18 }}>/100</span>
            </div>
            <span style={{ color: G1, fontSize: 12, paddingBottom: 6 }}>
              {score >= 80 ? '🔥 Elite' : score >= 60 ? '⚡ Strong' : score >= 30 ? '💪 Building' : '🌱 Start'}
            </span>
          </div>

          <Bar pct={score} />

          {/* Component breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: 8, marginTop: 16 }}>
            {[
              { label: 'Calories', done: stats.kcal > 0 },
              { label: 'Workout',  done: stats.workouts > 0 },
              { label: 'Streak',   done: stats.streak > 0 },
              { label: 'Focus',    done: stats.focusMins > 0 },
            ].map(c => (
              <div key={c.label} style={{ textAlign: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, margin: '0 auto 6px',
                  background: c.done ? `${L}15` : BD,
                  border: `1px solid ${c.done ? `${L}40` : BD}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} color={c.done ? L : G2} strokeWidth={c.done ? 2.5 : 1.5} />
                </div>
                <span style={{ color: G2, fontSize: 9 }}>{c.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════
            FOCUS TIMER — minimal
        ═══════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20 }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Label>Focus Session</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={12} color="#FF6B35" fill="#FF6B35" />
              <span style={{ color: G1, fontSize: 12 }}>
                {loading ? '—' : stats.streak} day streak
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1,
                color: focusOn ? L : W, fontVariantNumeric: 'tabular-nums' }}>
                {clock}
              </div>
              <div style={{ color: G1, fontSize: 12, marginTop: 6 }}>
                {focusOn ? 'Session active' : 'Deep work · 25 min'}
              </div>
            </div>

            <button type="button"
              onClick={() => { if (!focusOn && secs === 0) setSecs(25 * 60); setFocusOn(v => !v) }}
              style={{ width: 52, height: 52, borderRadius: 16, border: 'none', cursor: 'pointer',
                background: focusOn ? L : `${L}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                outline: 'none' }}>
              {focusOn
                ? <Pause size={20} color="#000" fill="#000" />
                : <Play size={20} color={L} fill={L} />
              }
            </button>
          </div>

          {/* Timer bar */}
          <div style={{ height: 3, borderRadius: 99, background: G2, overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', borderRadius: 99, background: L }}
              animate={{ width: `${(secs / (25 * 60)) * 100}%` }}
              transition={{ duration: 0.5 }} />
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════
            QUICK LOG ROW
        ═══════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Log Meal',    href: '/food?action=log',    icon: Dumbbell  },
            { label: 'Log Workout', href: '/workout?action=log', icon: Dumbbell  },
          ].map(btn => (
            <Link key={btn.label} href={btn.href}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 0', borderRadius: 16, background: C, border: `1px solid ${BD}`,
                color: G1, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              <Plus size={14} color={G1} />
              {btn.label}
            </Link>
          ))}
        </motion.div>

      </div>
    </div>
  )
}