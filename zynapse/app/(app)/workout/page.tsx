'use client'

// ============================================================
//  ZYNAPSE — WORKOUTS PAGE
//  Matches design: Plan tabs, workout split, recommended
// ============================================================

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Dumbbell, Check, Play, ChevronRight,
  Calendar, Clock, Flame,
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

type Tab = 'Plan' | 'Exercises' | 'Library' | 'History'

const TABS: Tab[] = ['Plan', 'Exercises', 'Library', 'History']

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const WORKOUT_PLANS: Record<string, {
  name: string; muscles: string; duration: string; kcal: number; done?: boolean
}[]> = {
  build_muscle: [
    { name: 'Push Day',              muscles: 'Chest · Shoulders · Triceps', duration: '45–60 min', kcal: 320, done: true },
    { name: 'Pull Day',              muscles: 'Back · Biceps',               duration: '40–55 min', kcal: 290 },
    { name: 'Leg Day',               muscles: 'Quads · Hamstrings · Calves', duration: '55–70 min', kcal: 380 },
    { name: 'Rest / Active Recovery',muscles: 'Mobility · Stretching · Cardio', duration: '30 min', kcal: 150 },
  ],
  lose_fat: [
    { name: 'HIIT Cardio',           muscles: 'Full Body · Cardio',          duration: '20–30 min', kcal: 350, done: true },
    { name: 'Core Blast',            muscles: 'Abs · Obliques',              duration: '25 min',    kcal: 180 },
    { name: 'Steady State Run',       muscles: 'Legs · Cardio',              duration: '40 min',    kcal: 400 },
    { name: 'Rest Day',              muscles: 'Active Recovery',              duration: '20 min',    kcal: 100 },
  ],
  lean_bulk: [
    { name: 'Upper Body A',          muscles: 'Chest · Back · Arms',         duration: '50 min',    kcal: 310, done: true },
    { name: 'Lower Body A',          muscles: 'Quads · Glutes · Calves',     duration: '55 min',    kcal: 360 },
    { name: 'Upper Body B',          muscles: 'Shoulders · Arms',            duration: '45 min',    kcal: 280 },
    { name: 'Lower Body B',          muscles: 'Hamstrings · Glutes',         duration: '50 min',    kcal: 330 },
  ],
  athletic_body: [
    { name: 'Power & Explosiveness', muscles: 'Full Body',                   duration: '50 min',    kcal: 420, done: true },
    { name: 'Speed & Agility',       muscles: 'Legs · Core',                 duration: '40 min',    kcal: 380 },
    { name: 'Endurance Circuit',     muscles: 'Cardio · VO2 Max',            duration: '45 min',    kcal: 450 },
    { name: 'Mobility & Recovery',   muscles: 'Flexibility · Balance',       duration: '30 min',    kcal: 120 },
  ],
  maintain_fitness: [
    { name: 'Full Body Strength',    muscles: 'All Muscle Groups',           duration: '45 min',    kcal: 280, done: true },
    { name: 'Cardio & Core',         muscles: 'Heart · Abs',                 duration: '35 min',    kcal: 300 },
    { name: 'Strength Focus',        muscles: 'Core · Stability',            duration: '40 min',    kcal: 260 },
    { name: 'Flexibility',           muscles: 'Yoga · Stretching',           duration: '30 min',    kcal: 100 },
  ],
}

const RECOMMENDED = [
  { name: 'HIIT Cardio',    detail: '20 min · 250 kcal', color: '#FF6B35' },
  { name: 'Yoga Flow',      detail: '30 min · 120 kcal', color: '#A78BFA' },
  { name: 'Core Strength',  detail: '25 min · 180 kcal', color: '#00D4FF' },
]

function Sk({ w = '100%', h = 14 }: { w?: string | number; h?: number }) {
  return (
    <motion.div
      animate={{ opacity: [0.12, 0.28, 0.12] }}
      transition={{ repeat: Infinity, duration: 1.8 }}
      style={{ width: w, height: h, borderRadius: 6, background: '#1e1e1e' }}
    />
  )
}

export default function WorkoutPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<Tab>('Plan')
  const [loading, setLoading]     = useState(true)
  const [goal, setGoal]           = useState('build_muscle')
  const [doneToday, setDoneToday] = useState(0)
  const [dayOfWeek, setDayOfWeek] = useState(0) // 0=Mon

  useEffect(() => {
    const d = new Date().getDay() // 0=Sun
    setDayOfWeek(d === 0 ? 6 : d - 1) // convert to 0=Mon
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: prof } = await supabase
          .from('profiles')
          .select('fitness_goal')
          .eq('id', user.id)
          .single()
        if (prof?.fitness_goal) setGoal(prof.fitness_goal)

        const today = new Date().toISOString().split('T')[0]
        const { count } = await supabase
          .from('workout_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`)
        setDoneToday(count ?? 0)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [supabase])

  const plan = WORKOUT_PLANS[goal] ?? WORKOUT_PLANS.build_muscle
  const totalThisWeek = 6
  const doneThisWeek  = doneToday + 3 // simulate

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: FONT, color: W, paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ padding: '52px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: W, lineHeight: 1 }}>Workouts</h1>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: G2, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Calendar size={18} color={G1} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {TABS.map(tab => (
            <button key={tab} type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px', borderRadius: 20, border: 'none',
                background: activeTab === tab ? L : G2,
                color: activeTab === tab ? '#000' : G1,
                fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
                cursor: 'pointer', fontFamily: FONT,
                transition: 'all 0.2s',
              }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <AnimatePresence mode="wait">
          {activeTab === 'Plan' && (
            <motion.div key="plan"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Weekly progress */}
              <div style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ color: G1, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>
                    THIS WEEK
                  </span>
                  <span style={{ color: L, fontWeight: 700, fontSize: 14 }}>
                    {Math.min(doneThisWeek, totalThisWeek)} / {totalThisWeek} Workouts
                  </span>
                </div>

                {/* Day dots */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
                  {WEEK_DAYS.map((day, i) => {
                    const isDone   = i < Math.min(doneThisWeek, 7)
                    const isToday  = i === dayOfWeek
                    const isFuture = i > dayOfWeek
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isDone ? L : isToday ? `${L}20` : G2,
                          border: isToday ? `2px solid ${L}` : 'none',
                        }}>
                          {isDone
                            ? <Check size={14} color="#000" strokeWidth={2.5} />
                            : isToday
                              ? <span style={{ color: L, fontWeight: 700, fontSize: 12 }}>W</span>
                              : <span style={{ width: 8, height: 8, borderRadius: '50%', background: isFuture ? '#333' : G1, display: 'block' }} />
                          }
                        </div>
                        <span style={{ color: isToday ? L : G1, fontSize: 10, fontWeight: isToday ? 700 : 400 }}>
                          {day}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Workout split */}
              <div style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, overflow: 'hidden' }}>
                <div style={{
                  padding: '16px 20px', borderBottom: `1px solid ${BD}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ color: G1, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>
                    WORKOUT SPLIT
                  </span>
                  <button type="button" style={{
                    background: 'none', border: 'none', color: L,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
                  }}>
                    Edit
                  </button>
                </div>

                {loading
                  ? [0,1,2,3].map(i => (
                      <div key={i} style={{ padding: '16px 20px', borderBottom: `1px solid ${BD}` }}>
                        <Sk h={14} />
                      </div>
                    ))
                  : plan.map((w, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.07 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '16px 20px',
                          borderBottom: i < plan.length - 1 ? `1px solid ${BD}` : 'none',
                          background: i === 0 ? `${L}04` : 'transparent',
                        }}>

                        {/* Muscle image placeholder */}
                        <div style={{
                          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                          background: i === 0 ? `${L}12` : G2,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Dumbbell size={20} color={i === 0 ? L : '#444'} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            color: i === 0 ? W : '#999',
                            fontWeight: i === 0 ? 700 : 500, fontSize: 15, marginBottom: 3,
                          }}>
                            {w.name}
                          </div>
                          <div style={{ color: G1, fontSize: 12 }}>{w.muscles}</div>
                          {i === 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={10} color={G1} />
                                <span style={{ color: G1, fontSize: 10 }}>{w.duration}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Flame size={10} color='#FF6B35' />
                                <span style={{ color: G1, fontSize: 10 }}>{w.kcal} kcal</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status icon */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: w.done ? L : i === 0 ? G2 : 'transparent',
                          border: w.done ? 'none' : i === 0 ? 'none' : `1px solid ${BD}`,
                        }}>
                          {w.done
                            ? <Check size={14} color="#000" strokeWidth={2.5} />
                            : i === 0
                              ? <Play size={12} color={G1} fill={G1} />
                              : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2a2a2a' }} />
                          }
                        </div>
                      </motion.div>
                    ))
                }
              </div>

              {/* Recommended for You */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: G1, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>
                    RECOMMENDED FOR YOU
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {RECOMMENDED.map((r, i) => (
                    <motion.button key={r.name} type="button"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 16px', borderRadius: 20,
                        background: C, border: `1px solid ${BD}`,
                        textAlign: 'left', width: '100%', cursor: 'pointer',
                        fontFamily: FONT,
                      }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                        background: `${r.color}12`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Dumbbell size={20} color={r.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: W, fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{r.name}</div>
                        <div style={{ color: G1, fontSize: 12 }}>{r.detail}</div>
                      </div>
                      <div style={{
                        width: 38, height: 38, borderRadius: 12, background: L,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Play size={15} color="#000" fill="#000" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {(activeTab === 'Exercises' || activeTab === 'Library' || activeTab === 'History') && (
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', paddingTop: 60, gap: 12,
              }}>
              <div style={{
                width: 60, height: 60, borderRadius: 18, background: G2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Dumbbell size={26} color={G1} />
              </div>
              <div style={{ color: W, fontWeight: 700, fontSize: 18 }}>{activeTab}</div>
              <div style={{ color: G1, fontSize: 13 }}>Coming soon — stay consistent.</div>
              <Link href="/workout" onClick={() => setActiveTab('Plan')}
                style={{
                  marginTop: 8, padding: '10px 20px', borderRadius: 14,
                  background: L, color: '#000', fontWeight: 700, fontSize: 13,
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                Back to Plan <ChevronRight size={14} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
