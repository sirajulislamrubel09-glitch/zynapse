'use client'

// ============================================================
//  ZYNAPSE — NUTRITION (FOOD) PAGE
//  Matches design: Calorie ring, macros, meal logs, water
// ============================================================

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Apple, Droplets, Plus,
  Camera, Zap, Brain,
  History, Utensils,
  LucideIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const L    = '#AAFF00'
const BG   = '#0A0A0A'
const C    = '#111111'
const BD   = '#1C1C1C'
const W    = '#FFFFFF'
const G1   = '#666666'
const G2   = '#252525'
const FONT = "'Syne','Inter',sans-serif"

type Profile = {
  daily_calorie_goal: number
  daily_protein_goal_g: number
  daily_carb_goal_g: number
  daily_fat_goal_g: number
  is_premium: boolean
}

type Meal = {
  id: string
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
}

type Stats = {
  kcal: number; protein: number; carbs: number; fat: number
  water: number
}

// ─── Calorie ring ───────────────────────────────────────────
function Ring({ pct }: { pct: number }) {
  const S = 180, sw = 12, r = (S - sw) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={S} height={S} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={S/2} cy={S/2} r={r} fill="none" stroke={G2} strokeWidth={sw} />
      <motion.circle cx={S/2} cy={S/2} r={r} fill="none" stroke={L} strokeWidth={sw}
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - Math.min(pct, 1)) }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </svg>
  )
}

// ─── Progress bar ────────────────────────────────────────────
function Bar({ pct, color = L }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 4, borderRadius: 99, background: G2, overflow: 'hidden' }}>
      <motion.div style={{ height: '100%', borderRadius: 99, background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
  )
}

export default function FoodPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [meals, setMeals]     = useState<Meal[]>([])
  const [stats, setStats]     = useState<Stats>({ kcal: 0, protein: 0, carbs: 0, fat: 0, water: 2.4 })
  const [insight, setInsight] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date().toISOString().split('T')[0]

        const [pR, mR] = await Promise.all([
          supabase.from('profiles').select('daily_calorie_goal,daily_protein_goal_g,daily_carb_goal_g,daily_fat_goal_g,is_premium').eq('id', user.id).single(),
          supabase.from('meals').select('*').eq('user_id', user.id).gte('logged_at', `${today}T00:00:00`),
        ])

        const p = pR.data as Profile | null
        const m = mR.data as Meal[] ?? []
        setProfile(p)
        setMeals(m)
        setStats(prev => ({
          ...prev,
          kcal:    m.reduce((s, x) => s + (x.calories  ?? 0), 0),
          protein: m.reduce((s, x) => s + (x.protein_g ?? 0), 0),
          carbs:   m.reduce((s, x) => s + (x.carbs_g   ?? 0), 0),
          fat:     m.reduce((s, x) => s + (x.fat_g     ?? 0), 0),
        }))

        // Simulating AI insight
        setInsight("You're high on protein today. Great for muscle recovery. Consider more fiber in your next meal.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  const calGoal = profile?.daily_calorie_goal ?? 2000
  const calPct  = stats.kcal / calGoal

  const MEAL_TYPES: { type: Meal['meal_type']; label: string; icon: LucideIcon }[] = [
    { type: 'breakfast', label: 'Breakfast', icon: Apple },
    { type: 'lunch',     label: 'Lunch',     icon: Utensils },
    { type: 'dinner',    label: 'Dinner',    icon: Utensils },
    { type: 'snack',     label: 'Snacks',    icon: Zap },
  ]

  return (
    <div style={{ background: BG, minHeight: '100vh', color: W, fontFamily: FONT, paddingBottom: 40 }}>

      {/* ── Header ────────────────────────────────────────── */}
      <div style={{ padding: '52px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800 }}>Nutrition</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" style={{ width: 40, height: 40, borderRadius: 12, background: G2, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={18} color={G1} />
          </button>
          <button type="button" style={{ width: 40, height: 40, borderRadius: 12, background: G2, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={18} color={L} />
          </button>
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Calorie Hero ────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 28, padding: 24 }}>

          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 24 }}>
            {loading ? <div style={{ width: 180, height: 180, borderRadius: '50%', background: G2 }} /> : <Ring pct={calPct} />}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: W }}>{Math.round(stats.kcal)}</span>
              <span style={{ color: G1, fontSize: 12, marginTop: 4 }}>of {calGoal} kcal</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { label: 'Protein', val: stats.protein, goal: profile?.daily_protein_goal_g ?? 150, color: L },
              { label: 'Carbs',   val: stats.carbs,   goal: profile?.daily_carb_goal_g ?? 200,    color: '#00D4FF' },
              { label: 'Fat',     val: stats.fat,     goal: profile?.daily_fat_goal_g ?? 60,     color: '#A78BFA' },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: G1, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em' }}>{m.label.toUpperCase()}</span>
                </div>
                <div style={{ color: W, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{Math.round(m.val)}g</div>
                <Bar pct={(m.val / m.goal) * 100} color={m.color} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Water Tracker ───────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={18} color="#00D4FF" />
            </div>
            <div>
              <div style={{ color: W, fontWeight: 700, fontSize: 15 }}>Water Intake</div>
              <div style={{ color: G1, fontSize: 12 }}>{stats.water}L of 3.5L</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ width: 8, height: 24, borderRadius: 4, background: i <= 3 ? '#00D4FF' : G2 }} />
            ))}
            <button type="button" style={{ width: 24, height: 24, borderRadius: 6, background: L, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>
              <Plus size={14} color="#000" />
            </button>
          </div>
        </motion.div>

        {/* ── Meal Logs ───────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MEAL_TYPES.map((mt, idx) => {
            const mealList = meals.filter(m => m.meal_type === mt.type)
            const Icon = mt.icon
            return (
              <motion.div key={mt.type} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + idx * 0.05 }}
                style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: G2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={G1} />
                    </div>
                    <div>
                      <div style={{ color: W, fontWeight: 700, fontSize: 15 }}>{mt.label}</div>
                      <div style={{ color: G1, fontSize: 11 }}>
                        {mealList.length > 0 ? `${mealList.length} items logged` : 'Not logged yet'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {mealList.length > 0 && (
                      <span style={{ color: W, fontWeight: 600, fontSize: 14 }}>
                        {mealList.reduce((s, x) => s + x.calories, 0)} <span style={{ color: G1, fontSize: 11, fontWeight: 400 }}>kcal</span>
                      </span>
                    )}
                    <button type="button" style={{ width: 32, height: 32, borderRadius: 10, background: G2, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={16} color={G1} />
                    </button>
                  </div>
                </div>
                {mealList.map(m => (
                  <div key={m.id} style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#aaa', fontSize: 13 }}>{m.name}</span>
                    <span style={{ color: G1, fontSize: 12 }}>{m.calories} kcal</span>
                  </div>
                ))}
              </motion.div>
            )
          })}
        </div>

        {/* ── AI Insight ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Brain size={16} color={L} />
            <span style={{ color: G1, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>AI ANALYTICS</span>
          </div>

          <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            {insight}
          </p>

          {!profile?.is_premium && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,17,17,0.8)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
              <Zap size={20} color={L} fill={L} style={{ marginBottom: 8 }} />
              <div style={{ color: W, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Unlock AI Insights</div>
              <div style={{ color: G1, fontSize: 11, marginBottom: 12 }}>Get personalized nutrition advice and macro breakdowns.</div>
              <Link href="/profile?upgrade=1" style={{ padding: '6px 16px', borderRadius: 10, background: L, color: '#000', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                Upgrade to Pro
              </Link>
            </div>
          )}
        </motion.div>

      </div>

      {/* ── Scan FAB ────────────────────────────────────── */}
      <motion.button whileTap={{ scale: 0.9 }}
        style={{ position: 'fixed', bottom: 100, right: 20, width: 56, height: 56, borderRadius: '50%', background: L, border: 'none', boxShadow: `0 8px 24px ${L}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <Camera size={24} color="#000" />
      </motion.button>
    </div>
  )
}
