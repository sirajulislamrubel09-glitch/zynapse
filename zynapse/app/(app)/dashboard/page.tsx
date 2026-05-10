'use client'

// ============================================================
//  ZYNAPSE — DASHBOARD (CLEAN REBUILD)
//  File: app/(app)/dashboard/page.tsx
// ============================================================

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Bell,
  Zap,
  Flame,
  Dumbbell,
  Droplets,
  Brain,
  ChevronRight,
  Shield,
  Play,
  Pause,
  TrendingUp,
  Timer,
  Plus,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

// ─── Design tokens ───────────────────────────────────────────

const L = '#AAFF00'
const BG = '#080808'
const CARD = '#101010'
const BD = '#1C1C1C'
const SUB = '#666'
const DIM = '#333'

// ─── Types ───────────────────────────────────────────────────

type Profile = {
  full_name: string
  fitness_goal: string
  daily_calorie_goal: number
  daily_protein_goal_g: number
  daily_carb_goal_g: number
  daily_fat_goal_g: number
}

type Stats = {
  caloriesIn: number
  protein: number
  carbs: number
  fat: number
  workouts: number
  detoxStreak: number
  focusMins: number
}

// ─── Greeting helper ─────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()

  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'

  return 'Good Evening'
}

// ─── Calorie ring ────────────────────────────────────────────

function CalorieRing({
  consumed,
  goal,
}: {
  consumed: number
  goal: number
}) {
  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0

  const SIZE = 180
  const SW = 12
  const R = (SIZE - SW) / 2
  const CIRC = 2 * Math.PI * R

  const offset = CIRC * (1 - pct)

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: SIZE, height: SIZE }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={BD}
          strokeWidth={SW}
        />

        {/* Progress */}
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={L}
          strokeWidth={SW}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          {consumed.toLocaleString()}
        </span>

        <span
          style={{
            color: SUB,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          of {goal.toLocaleString()} kcal
        </span>

        <div
          className="mt-2 rounded-full px-2.5 py-1"
          style={{
            background: `${L}15`,
            border: `1px solid ${L}30`,
          }}
        >
          <span
            style={{
              color: L,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {Math.round(pct * 100)}% of goal
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Macro pill ──────────────────────────────────────────────

function MacroPill({
  label,
  consumed,
  goal,
  color,
}: {
  label: string
  consumed: number
  goal: number
  color: string
}) {
  const pct =
    goal > 0
      ? Math.min((consumed / goal) * 100, 100)
      : 0

  return (
    <div className="flex-1">
      <div className="mb-1.5 flex justify-between">
        <span
          style={{
            color: SUB,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {label}
        </span>

        <span
          style={{
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {Math.round(consumed)}
          <span style={{ color: SUB }}>
            /{goal}g
          </span>
        </span>
      </div>

      <div
        style={{
          height: 4,
          borderRadius: 99,
          background: DIM,
        }}
      >
        <motion.div
          style={{
            height: '100%',
            borderRadius: 99,
            background: color,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
            delay: 0.4,
          }}
        />
      </div>
    </div>
  )
}

// ─── Stat card ───────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  sub,
  color,
  delay,
}: {
  icon: React.ElementType
  value: string
  label: string
  sub?: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex-1 rounded-2xl p-4"
      style={{
        background: CARD,
        border: `1px solid ${BD}`,
      }}
    >
      <div
        className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl"
        style={{
          background: `${color}12`,
        }}
      >
        <Icon size={16} color={color} />
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: SUB,
          fontSize: 11,
          marginTop: 4,
        }}
      >
        {label}
      </div>

      {sub && (
        <div
          style={{
            color: DIM,
            fontSize: 10,
            marginTop: 2,
          }}
        >
          {sub}
        </div>
      )}
    </motion.div>
  )
}

// ─── Section header ──────────────────────────────────────────

function SectionHeader({
  title,
  href,
}: {
  title: string
  href?: string
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span
        style={{
          color: '#fff',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.04em',
        }}
      >
        {title}
      </span>

      {href && (
        <Link
          href={href}
          className="flex items-center gap-0.5"
          style={{
            color: SUB,
            fontSize: 12,
          }}
        >
          See all
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  )
}

// ─── Workout plans ───────────────────────────────────────────

const WORKOUT_PLANS: Record<
  string,
  {
    day: string
    name: string
    muscles: string
    pct: number
  }[]
> = {
  build_muscle: [
    {
      day: 'Today',
      name: 'Push Day',
      muscles: 'Chest · Shoulders · Triceps',
      pct: 0,
    },
    {
      day: 'Tomorrow',
      name: 'Pull Day',
      muscles: 'Back · Biceps',
      pct: 0,
    },
    {
      day: 'Wed',
      name: 'Leg Day',
      muscles: 'Quads · Hamstrings',
      pct: 0,
    },
    {
      day: 'Thu',
      name: 'Recovery',
      muscles: 'Mobility · Stretching',
      pct: 0,
    },
  ],

  lose_fat: [
    {
      day: 'Today',
      name: 'HIIT',
      muscles: 'Full Body · Cardio',
      pct: 0,
    },
    {
      day: 'Tomorrow',
      name: 'Core',
      muscles: 'Abs · Obliques',
      pct: 0,
    },
    {
      day: 'Wed',
      name: 'Cardio',
      muscles: 'Endurance · Fat Burn',
      pct: 0,
    },
    {
      day: 'Thu',
      name: 'Rest',
      muscles: 'Active Recovery',
      pct: 0,
    },
  ],
}

// ============================================================
//  MAIN PAGE
// ============================================================

export default function DashboardPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)

  const [profile, setProfile] =
    useState<Profile | null>(null)

  const [stats, setStats] = useState<Stats>({
    caloriesIn: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    workouts: 0,
    detoxStreak: 0,
    focusMins: 0,
  })

  const [insight, setInsight] = useState('')

  const [focusOn, setFocusOn] = useState(false)

  const [secs, setSecs] = useState(25 * 60)

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    )

  // ─── Focus timer ──────────────────────────────────────────

  useEffect(() => {
    if (focusOn) {
      timerRef.current = setInterval(() => {
        setSecs((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current!)
            setFocusOn(false)
            return 0
          }

          return s - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [focusOn])

  const timerLabel = `${String(
    Math.floor(secs / 60)
  ).padStart(2, '0')}:${String(
    secs % 60
  ).padStart(2, '0')}`

  // ─── Load data ────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const today = new Date()
          .toISOString()
          .split('T')[0]

        const [
          pRes,
          mRes,
          wRes,
          dRes,
          fRes,
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select(
              `
                full_name,
                fitness_goal,
                daily_calorie_goal,
                daily_protein_goal_g,
                daily_carb_goal_g,
                daily_fat_goal_g
              `
            )
            .eq('id', user.id)
            .single(),

          supabase
            .from('meals')
            .select(
              'calories,protein_g,carbs_g,fat_g'
            )
            .eq('user_id', user.id)
            .gte(
              'logged_at',
              `${today}T00:00:00`
            ),

          supabase
            .from('workout_logs')
            .select('id')
            .eq('user_id', user.id)
            .gte(
              'created_at',
              `${today}T00:00:00`
            ),

          supabase
            .from('detox_logs')
            .select('streak_current')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('streak_current', {
              ascending: false,
            })
            .limit(1),

          supabase
            .from('focus_sessions')
            .select('duration_mins')
            .eq('user_id', user.id)
            .eq('completed', true)
            .gte(
              'created_at',
              `${today}T00:00:00`
            ),
        ])

        const p = pRes.data as Profile | null

        const meals = mRes.data ?? []

        setProfile(p)

        setStats({
          caloriesIn: meals.reduce(
            (s, m) => s + (m.calories ?? 0),
            0
          ),

          protein: meals.reduce(
            (s, m) => s + (m.protein_g ?? 0),
            0
          ),

          carbs: meals.reduce(
            (s, m) => s + (m.carbs_g ?? 0),
            0
          ),

          fat: meals.reduce(
            (s, m) => s + (m.fat_g ?? 0),
            0
          ),

          workouts: (wRes.data ?? []).length,

          detoxStreak:
            dRes.data?.[0]?.streak_current ?? 0,

          focusMins: (
            fRes.data ?? []
          ).reduce(
            (s, f) =>
              s + (f.duration_mins ?? 0),
            0
          ),
        })

        setInsight(
          'Consistency compounds. Your momentum today is stronger than yesterday.'
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [supabase])

  // ─── Computed ─────────────────────────────────────────────

  const firstName =
    profile?.full_name?.split(' ')[0] ??
    'Champion'

  const calGoal =
    profile?.daily_calorie_goal ?? 2000

  const remaining = Math.max(
    calGoal - stats.caloriesIn,
    0
  )

  const planKey =
    profile?.fitness_goal ?? 'build_muscle'

  const workoutPlan =
    WORKOUT_PLANS[planKey] ??
    WORKOUT_PLANS.build_muscle

  const todayWorkout = workoutPlan[0]

  const score = Math.min(
    Math.round(
      Math.min(stats.caloriesIn / calGoal, 1) *
        30 +
        Math.min(stats.workouts, 1) * 30 +
        Math.min(stats.detoxStreak / 7, 1) *
          20 +
        Math.min(stats.focusMins / 60, 1) *
          20
    ),
    100
  )

  // ─── Skeleton ─────────────────────────────────────────────

  function Sk({
    w = '100%',
    h = 14,
  }: {
    w?: string | number
    h?: number
  }) {
    return (
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
        }}
        style={{
          width: w,
          height: h,
          borderRadius: 6,
          background: '#1a1a1a',
        }}
      />
    )
  }

  // ==========================================================
  //  UI
  // ==========================================================

  return (
    <div
      style={{
        background: BG,
        minHeight: '100vh',
        fontFamily:
          "'Syne','Inter',sans-serif",
      }}
    >
      <div className="px-5 pb-10 pt-14">
        <h1
          style={{
            color: '#fff',
            fontSize: 32,
            fontWeight: 900,
          }}
        >
          {getGreeting()}
        </h1>

        <p
          style={{
            color: SUB,
            marginTop: 6,
          }}
        >
          Welcome back, {firstName}
        </p>

        {/* Your full UI continues here */}
      </div>
    </div>
  )
}