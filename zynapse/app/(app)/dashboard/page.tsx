'use client'

// ============================================================
//  ZYNAPSE — DASHBOARD PAGE
//  File: app/(app)/dashboard/page.tsx
// ============================================================

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Flame, Dumbbell, Droplets, Brain, ChevronRight,
  Bell, Zap, Moon, Footprints, Timer, TrendingUp,
  ArrowUpRight, Shield, Play, MoreHorizontal,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─── Tokens ──────────────────────────────────────────────────
const L   = '#AAFF00'
const BG  = '#080808'
const C1  = '#0F0F0F'
const C2  = '#141414'
const BD  = '#1E1E1E'
const CYN = '#00D4FF'
const PUR = '#A78BFA'
const ORG = '#FF6B35'
const MUT = '#444'
const SUB = '#777'

// ─── Types ───────────────────────────────────────────────────
type Profile = {
  full_name: string
  fitness_goal: string
  daily_calorie_goal: number
  daily_protein_goal_g: number
  is_premium: boolean
}

type DashData = {
  profile: Profile | null
  caloriesConsumed: number
  proteinConsumed: number
  workoutsToday: number
  detoxStreak: number
  focusMins: number
  aiInsight: string
  disciplineScore: number
}

// ─── Workout plans by goal ────────────────────────────────────
const PLANS: Record<string, { name: string; muscles: string; progress: number; color: string }[]> = {
  build_muscle:     [
    { name: 'Push Day',  muscles: 'Chest · Shoulders · Triceps', progress: 80, color: L   },
    { name: 'Pull Day',  muscles: 'Back · Biceps',               progress: 50, color: CYN },
    { name: 'Leg Day',   muscles: 'Quads · Hamstrings',          progress: 40, color: ORG },
    { name: 'Recovery',  muscles: 'Mobility · Stretching',       progress: 20, color: PUR },
  ],
  lose_fat:         [
    { name: 'HIIT',      muscles: 'Full Body · Cardio',          progress: 75, color: ORG },
    { name: 'Core Burn', muscles: 'Abs · Obliques',              progress: 55, color: L   },
    { name: 'Cardio',    muscles: 'Endurance · Fat Burn',        progress: 40, color: CYN },
    { name: 'Rest Day',  muscles: 'Active Recovery',             progress: 30, color: PUR },
  ],
  lean_bulk:        [
    { name: 'Upper A',   muscles: 'Chest · Back · Arms',        progress: 70, color: L   },
    { name: 'Lower A',   muscles: 'Quads · Hamstrings · Calves',progress: 50, color: ORG },
    { name: 'Upper B',   muscles: 'Shoulders · Arms',           progress: 35, color: CYN },
    { name: 'Lower B',   muscles: 'Glutes · Hamstrings',        progress: 20, color: PUR },
  ],
  athletic_body:    [
    { name: 'Power',     muscles: 'Explosive Strength',         progress: 85, color: L   },
    { name: 'Speed',     muscles: 'Agility · Sprint',           progress: 60, color: CYN },
    { name: 'Endurance', muscles: 'Cardio · VO2 Max',           progress: 45, color: ORG },
    { name: 'Mobility',  muscles: 'Flexibility · Balance',      progress: 25, color: PUR },
  ],
  maintain_fitness: [
    { name: 'Full Body', muscles: 'Balanced Strength',          progress: 65, color: L   },
    { name: 'Cardio',    muscles: 'Heart Health',               progress: 50, color: CYN },
    { name: 'Strength',  muscles: 'Core · Stability',           progress: 40, color: ORG },
    { name: 'Flex Day',  muscles: 'Yoga · Stretching',          progress: 30, color: PUR },
  ],
}

// ─── Greeting ─────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

// ─── Circular progress ring ───────────────────────────────────
function Ring({ pct, size = 120, stroke = 10 }: { pct: number; size?: number; stroke?: number }) {
  const r   = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash  = circ * (1 - Math.min(pct, 100) / 100)
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BD} strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={L} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: dash }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />
    </svg>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────
function Skeleton({ h = 16, w = '100%', rounded = 8 }: { h?: number; w?: string | number; rounded?: number }) {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      style={{ height: h, width: w, borderRadius: rounded, background: '#1a1a1a' }}
    />
  )
}

// ─── Mini stat card ───────────────────────────────────────────
function MiniCard({
  icon: Icon, color, label, value, unit, pct, delay
}: {
  icon: React.ElementType; color: string; label: string
  value: string; unit: string; pct: number; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex-shrink-0 p-4 rounded-2xl"
      style={{ background: C2, border: `1px solid ${BD}`, width: 140 }}
    >
      <Icon size={18} color={color} style={{ marginBottom: 10 }} />
      <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
        {value}<span style={{ fontSize: 12, color: SUB, fontWeight: 500, marginLeft: 2 }}>{unit}</span>
      </div>
      <div style={{ color: SUB, fontSize: 11, marginTop: 4, marginBottom: 10 }}>{label}</div>
      <div style={{ height: 3, borderRadius: 99, background: BD }}>
        <motion.div
          style={{ height: '100%', borderRadius: 99, background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay }}
        />
      </div>
      <div style={{ color: MUT, fontSize: 10, marginTop: 4, textAlign: 'right' }}>{pct}%</div>
    </motion.div>
  )
}

// ─── Workout plan card ────────────────────────────────────────
function WorkoutCard({
  plan, active, delay
}: {
  plan: { name: string; muscles: string; progress: number; color: string }
  active: boolean; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex-shrink-0 rounded-2xl overflow-hidden relative"
      style={{
        width: 150, height: 190,
        background: C2,
        border: `1.5px solid ${active ? plan.color : BD}`,
      }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 70% 20%, ${plan.color}10 0%, transparent 70%)` }} />

      {active && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: plan.color }}>
          <Zap size={12} color="#000" strokeWidth={3} />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
          {plan.name}
        </div>
        <div style={{ color: SUB, fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>
          {plan.muscles}
        </div>
        <div style={{ height: 3, borderRadius: 99, background: BD }}>
          <motion.div
            style={{ height: '100%', borderRadius: 99, background: plan.color }}
            initial={{ width: 0 }}
            animate={{ width: `${plan.progress}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay }}
          />
        </div>
        <div style={{ color: plan.color, fontSize: 11, fontWeight: 700, marginTop: 4 }}>
          {plan.progress}%
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================
//  MAIN COMPONENT
// ============================================================
export default function DashboardPage() {
  const supabase = createClient()
  const [loading, setLoading]   = useState(true)
  const [data, setData]         = useState<DashData>({
    profile: null, caloriesConsumed: 0, proteinConsumed: 0,
    workoutsToday: 0, detoxStreak: 0, focusMins: 0,
    aiInsight: '', disciplineScore: 0,
  })
  const [focusOn, setFocusOn]   = useState(false)
  const [focusSecs, setFocusSecs] = useState(45 * 60)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Focus timer ───────────────────────────────────────────
  useEffect(() => {
    if (focusOn) {
      timerRef.current = setInterval(() => {
        setFocusSecs(s => {
          if (s <= 1) { clearInterval(timerRef.current!); setFocusOn(false); return 0 }
          return s - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [focusOn])

  const timerDisplay = `${String(Math.floor(focusSecs / 60)).padStart(2, '0')}:${String(focusSecs % 60).padStart(2, '0')}`

  // ── Fetch dashboard data ──────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date().toISOString().split('T')[0]

        // Parallel fetches
        const [profileRes, mealsRes, workoutsRes, detoxRes, focusRes] = await Promise.all([
          supabase.from('profiles').select('full_name,fitness_goal,daily_calorie_goal,daily_protein_goal_g,is_premium').eq('id', user.id).single(),
          supabase.from('meals').select('calories,protein_g').eq('user_id', user.id).gte('logged_at', `${today}T00:00:00`),
          supabase.from('workout_logs').select('id').eq('user_id', user.id).gte('created_at', `${today}T00:00:00`),
          supabase.from('detox_logs').select('streak_current').eq('user_id', user.id).eq('status', 'active').order('streak_current', { ascending: false }).limit(1),
          supabase.from('focus_sessions').select('duration_mins').eq('user_id', user.id).eq('completed', true).gte('created_at', `${today}T00:00:00`),
        ])

        const profile       = profileRes.data as Profile | null
        const meals         = mealsRes.data ?? []
        const workoutsToday = (workoutsRes.data ?? []).length
        const detoxStreak   = detoxRes.data?.[0]?.streak_current ?? 0
        const focusMins     = (focusRes.data ?? []).reduce((s, f) => s + (f.duration_mins ?? 0), 0)
        const caloriesConsumed = meals.reduce((s, m) => s + (m.calories ?? 0), 0)
        const proteinConsumed  = meals.reduce((s, m) => s + (m.protein_g ?? 0), 0)

        // Discipline score (0–100)
        const goal = profile?.daily_calorie_goal ?? 2000
        const calPct = goal > 0 ? Math.min(caloriesConsumed / goal, 1) : 0
        const disciplineScore = Math.round(
          calPct * 25 +
          Math.min(workoutsToday, 1) * 25 +
          Math.min(detoxStreak / 7, 1) * 25 +
          Math.min(focusMins / 60, 1) * 25
        )

        // AI insight via Groq
        let aiInsight = 'Stay consistent. Every rep, every meal, every choice compounds into the person you\'re becoming.'
        try {
          const res = await fetch('/api/ai/insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: profile?.full_name?.split(' ')[0] ?? 'Champion',
              goal: profile?.fitness_goal,
              caloriesConsumed,
              calorieGoal: profile?.daily_calorie_goal,
              workoutsToday,
              detoxStreak,
              focusMins,
              disciplineScore,
            }),
          })
          if (res.ok) {
            const json = await res.json()
            if (json.insight) aiInsight = json.insight
          }
        } catch { /* keep fallback */ }

        setData({
          profile, caloriesConsumed, proteinConsumed,
          workoutsToday, detoxStreak, focusMins,
          aiInsight, disciplineScore,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  const { profile, caloriesConsumed, workoutsToday, detoxStreak, focusMins, aiInsight, disciplineScore } = data
  const goalCal    = profile?.daily_calorie_goal ?? 2000
  const calPct     = Math.round(Math.min((caloriesConsumed / goalCal) * 100, 100))
  const firstName  = profile?.full_name?.split(' ')[0] ?? 'Champion'
  const planKey    = profile?.fitness_goal ?? 'build_muscle'
  const plans      = PLANS[planKey] ?? PLANS.build_muscle

  // ============================================================
  //  RENDER
  // ============================================================
  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff', fontFamily: "'Syne','Inter',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box}`}</style>

      <div className="px-4 pt-12 pb-4">

        {/* ════════════════════════════════════════════════
            HEADER
        ════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <p style={{ color: SUB, fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{greeting()},</p>
            {loading
              ? <Skeleton h={28} w={140} rounded={6} />
              : <div className="flex items-center gap-2">
                  <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{firstName}</h1>
                  <Zap size={20} color={L} fill={L} />
                </div>
            }
            <p style={{ color: MUT, fontSize: 11, marginTop: 4 }}>Discipline today. Freedom tomorrow.</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Streak badge */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ background: C2, border: `1px solid ${BD}` }}>
              <Flame size={15} color={ORG} fill={ORG} />
              {loading
                ? <Skeleton h={14} w={24} rounded={4} />
                : <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{detoxStreak}</span>
              }
              <span style={{ color: SUB, fontSize: 10 }}>streak</span>
            </div>

            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${L}22`, border: `2px solid ${L}44` }}>
                <span style={{ color: L, fontWeight: 800, fontSize: 14 }}>
                  {firstName.charAt(0)}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                style={{ background: '#00DD55', border: `2px solid ${BG}` }} />
            </div>

            {/* Bell */}
            <button type="button" className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: C2, border: `1px solid ${BD}` }}>
              <Bell size={16} color={SUB} />
            </button>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════
            AI BANNER
        ════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Link href="/coach"
            className="flex items-center justify-between px-4 py-3 rounded-2xl mb-5"
            style={{ background: 'rgba(0,212,255,0.05)', border: `1px solid rgba(0,212,255,0.15)` }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0,212,255,0.12)' }}>
                <Brain size={16} color={CYN} />
              </div>
              <div>
                <div style={{ color: CYN, fontWeight: 700, fontSize: 12 }}>ZYNAPSE AI</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00DD55' }} />
                  <span style={{ color: SUB, fontSize: 10 }}>Online · Ready to optimize you</span>
                </div>
              </div>
            </div>
            <ChevronRight size={16} color={MUT} />
          </Link>
        </motion.div>

        {/* ════════════════════════════════════════════════
            TODAY'S OVERVIEW CARD
        ════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-4 rounded-3xl mb-4"
          style={{ background: C1, border: `1px solid ${BD}` }}>

          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} color={L} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em' }}>
                TODAY&apos;S OVERVIEW
              </span>
            </div>
            <button type="button"><MoreHorizontal size={16} color={MUT} /></button>
          </div>

          <div className="flex items-center gap-4">
            {/* Ring */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              {loading
                ? <div className="w-28 h-28 rounded-full" style={{ background: C2 }} />
                : <Ring pct={calPct} size={112} stroke={9} />
              }
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{calPct}%</span>
                <span style={{ color: SUB, fontSize: 9, fontWeight: 600 }}>Daily Goal</span>
              </div>
            </div>

            {/* 4 stats */}
            <div className="flex-1 grid grid-cols-2 gap-2.5">
              {[
                { icon: Flame,    color: ORG, label: 'Cal Burned',  value: loading ? '—' : caloriesConsumed.toLocaleString(), change: '+18%' },
                { icon: Dumbbell, color: L,   label: 'Workouts',    value: loading ? '—' : workoutsToday.toString(),           change: '+12%' },
                { icon: Droplets, color: CYN, label: 'Water (L)',   value: '2.4',                                              change: '+92%' },
                { icon: Brain,    color: PUR, label: 'Score',       value: loading ? '—' : disciplineScore.toString(),         change: '+15%' },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="p-2.5 rounded-xl" style={{ background: C2 }}>
                    <Icon size={13} color={s.color} style={{ marginBottom: 4 }} />
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ color: SUB, fontSize: 9, marginTop: 2 }}>{s.label}</div>
                    <div style={{ color: L, fontSize: 9, fontWeight: 600, marginTop: 2 }}>
                      <ArrowUpRight size={8} style={{ display: 'inline' }} />{s.change}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════
            AI COACH INSIGHT
        ════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-3xl mb-4 overflow-hidden"
          style={{ background: C1, border: `1px solid ${BD}` }}>
          <div className="flex gap-0">
            {/* Circuit SVG side panel */}
            <div className="w-28 relative flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0a1520 0%, #051020 100%)', minHeight: 130 }}>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 112 130" fill="none">
                {/* Head */}
                <ellipse cx="56" cy="45" rx="24" ry="30" stroke={CYN} strokeWidth="0.6" opacity="0.5" fill="rgba(0,212,255,0.03)" />
                {/* Circuit lines */}
                <line x1="56" y1="75" x2="56" y2="100" stroke={CYN} strokeWidth="0.6" opacity="0.5" />
                <line x1="56" y1="95" x2="80" y2="95" stroke={CYN} strokeWidth="0.6" opacity="0.5" />
                <line x1="56" y1="100" x2="30" y2="100" stroke={CYN} strokeWidth="0.6" opacity="0.4" />
                <line x1="32" y1="45" x2="15" y2="45" stroke={CYN} strokeWidth="0.6" opacity="0.4" />
                <line x1="15" y1="45" x2="15" y2="65" stroke={CYN} strokeWidth="0.6" opacity="0.4" />
                <line x1="80" y1="45" x2="97" y2="45" stroke={CYN} strokeWidth="0.6" opacity="0.4" />
                <circle cx="80" cy="95" r="2.5" fill={CYN} opacity="0.8" />
                <circle cx="30" cy="100" r="2" fill={CYN} opacity="0.7" />
                <circle cx="15" cy="65" r="2" fill={CYN} opacity="0.7" />
                <circle cx="97" cy="45" r="2" fill={CYN} opacity="0.7" />
                {/* Eyes */}
                <ellipse cx="48" cy="40" rx="4" ry="3" fill={CYN} opacity="0.6" />
                <ellipse cx="64" cy="40" rx="4" ry="3" fill={CYN} opacity="0.6" />
                {/* Glowing center */}
                <motion.circle cx="56" cy="45" r="5" fill={CYN}
                  animate={{ opacity: [0.4, 0.9, 0.4], r: [4, 6, 4] }}
                  transition={{ repeat: Infinity, duration: 2.5 }} />
              </svg>
            </div>

            {/* Text content */}
            <div className="flex-1 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={11} color={L} />
                <span style={{ color: L, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em' }}>
                  AI COACH INSIGHT
                </span>
              </div>
              {loading
                ? <><Skeleton h={14} w="90%" rounded={4} /><div className="mt-2"><Skeleton h={12} w="75%" rounded={4} /></div></>
                : <p style={{ color: '#ddd', fontSize: 13, lineHeight: 1.55, fontWeight: 500 }}>{aiInsight}</p>
              }
              <Link href="/coach"
                className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: BD, color: '#ccc' }}>
                View Full Insight <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════
            MINI STAT CARDS (horizontal scroll)
        ════════════════════════════════════════════════ */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Today&apos;s Activity</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <MiniCard icon={Moon}      color={PUR} label="Sleep"      value="7h 32m" unit="" pct={85} delay={0.25} />
            <MiniCard icon={Footprints} color={L}  label="Steps"      value="8,742"  unit="" pct={72} delay={0.30} />
            <MiniCard icon={Flame}     color={ORG} label="Protein"    value={loading ? '0' : Math.round(data.proteinConsumed).toString()} unit="g" pct={68} delay={0.35} />
            <MiniCard icon={Timer}     color={CYN} label="Focus Time" value={`${focusMins}m`} unit="" pct={75} delay={0.40} />
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            WORKOUT PLAN
        ════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Dumbbell size={14} color={L} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>WORKOUT PLAN</span>
            </div>
            <Link href="/workout"
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: L }}>
              View All <ChevronRight size={13} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {plans.map((plan, i) => (
              <WorkoutCard key={plan.name} plan={plan} active={i === 0} delay={0.3 + i * 0.07} />
            ))}
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════
            DOPAMINE DETOX
        ════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="p-4 rounded-3xl mb-4"
          style={{ background: C1, border: `1px solid ${BD}` }}>

          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} color={L} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em' }}>
              DOPAMINE DETOX
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Focus mode + timer */}
            <div className="col-span-1 p-3 rounded-2xl" style={{ background: C2 }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: SUB, fontSize: 10, fontWeight: 600 }}>Focus Mode</span>
                <button type="button" onClick={() => setFocusOn(v => !v)}
                  className="relative w-9 h-5 rounded-full transition-colors"
                  style={{ background: focusOn ? L : BD }}>
                  <motion.div animate={{ x: focusOn ? 16 : 2 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute top-0.5 w-4 h-4 rounded-full"
                    style={{ background: focusOn ? '#000' : '#555' }} />
                </button>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: focusOn ? L : '#fff', lineHeight: 1 }}>
                {timerDisplay}
              </div>
              <div style={{ color: SUB, fontSize: 9, marginTop: 4 }}>Time Remaining</div>
              <button type="button"
                onClick={() => { setFocusOn(v => !v); if (!focusOn && focusSecs === 0) setFocusSecs(45 * 60) }}
                className="mt-3 w-full py-1.5 rounded-lg flex items-center justify-center gap-1 text-xs font-bold"
                style={{ background: focusOn ? 'rgba(170,255,0,0.15)' : BD, color: focusOn ? L : '#ccc' }}>
                <Play size={10} fill={focusOn ? L : '#ccc'} />
                {focusOn ? 'Pause' : 'Start'}
              </button>
            </div>

            {/* Detox streak */}
            <div className="p-3 rounded-2xl" style={{ background: C2 }}>
              <div style={{ color: SUB, fontSize: 10, fontWeight: 600, marginBottom: 8 }}>Detox Streak</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: L, lineHeight: 1 }}>
                {loading ? '—' : detoxStreak}
              </div>
              <div style={{ color: SUB, fontSize: 9, marginTop: 4 }}>Days</div>
              {/* mini sparkline */}
              <svg width="100%" height="24" viewBox="0 0 80 24" fill="none" className="mt-2">
                <motion.path d="M0 18 Q10 14 20 16 Q35 18 40 10 Q55 4 65 8 Q72 12 80 6"
                  stroke={L} strokeWidth="1.5" fill="none" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }} />
              </svg>
            </div>

            {/* Distractions blocked */}
            <div className="p-3 rounded-2xl flex flex-col" style={{ background: C2 }}>
              <div style={{ color: SUB, fontSize: 10, fontWeight: 600, marginBottom: 8 }}>Blocked</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>128</div>
              <div style={{ color: SUB, fontSize: 9, marginTop: 4 }}>Today</div>
              <div className="mt-auto">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mt-3"
                  style={{ background: `${L}18` }}>
                  <Shield size={18} color={L} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════
            DISCIPLINE SCORE SUMMARY
        ════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="p-4 rounded-3xl mb-4 flex items-center gap-4"
          style={{ background: `linear-gradient(135deg, rgba(170,255,0,0.06) 0%, rgba(170,255,0,0.02) 100%)`, border: `1px solid rgba(170,255,0,0.15)` }}>
          {/* Score ring */}
          <div className="relative flex-shrink-0">
            <Ring pct={disciplineScore} size={72} stroke={6} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{loading ? '—' : disciplineScore}</span>
            </div>
          </div>
          <div className="flex-1">
            <div style={{ color: L, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 4 }}>
              DISCIPLINE SCORE
            </div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              {disciplineScore >= 80 ? 'Elite Performance 🔥' :
               disciplineScore >= 60 ? 'Strong Progress ⚡' :
               disciplineScore >= 40 ? 'Keep Going 💪' : 'Build the habit 🌱'}
            </div>
            <div style={{ color: SUB, fontSize: 11 }}>
              Top {disciplineScore >= 80 ? '5%' : disciplineScore >= 60 ? '20%' : '50%'} of users today
            </div>
          </div>
          <Link href="/profile">
            <ChevronRight size={18} color={MUT} />
          </Link>
        </motion.div>

      </div>
    </div>
  )
}