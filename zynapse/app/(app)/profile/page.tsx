'use client'

// ============================================================
//  ZYNAPSE — PROFILE PAGE
//  Matches design: stats, achievements, settings
// ============================================================

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Settings, Bell, HelpCircle, ChevronRight,
  Flame, Dumbbell, Clock, Zap, LogOut, Camera,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const L    = '#AAFF00'
const BG   = '#0A0A0A'
const C    = '#111111'
const BD   = '#1C1C1C'
const W    = '#FFFFFF'
const G1   = '#666666'
const G2   = '#252525'
const FONT = "'Syne','Inter',sans-serif"

type Profile = {
  full_name: string
  email: string
  fitness_goal: string
  daily_calorie_goal: number
  is_premium: boolean
  avatar_url?: string
}

type Stats = {
  totalWorkouts: number
  totalCalories: number
  totalHours: number
  avgDiscipline: number
  streak: number
}

const ACHIEVEMENTS = [
  { label: 'First Step',       icon: '🏆', color: '#A78BFA', unlocked: true  },
  { label: 'Consistency\nMaster', icon: '🎯', color: '#FF6B35', unlocked: true  },
  { label: '30 Day\nStreak',   icon: '🔥', color: '#FF6B35', unlocked: true  },
  { label: 'Early Bird',       icon: '⚡', color: L,         unlocked: false },
]

const GOAL_LABELS: Record<string, string> = {
  build_muscle:     'Build Muscle',
  lose_fat:         'Lose Fat',
  lean_bulk:        'Lean Bulk',
  athletic_body:    'Athletic Body',
  maintain_fitness: 'Maintain Fitness',
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

export default function ProfilePage() {
  const supabase = createClient()
  const router   = useRouter()
  const [loading, setLoading]   = useState(true)
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [stats, setStats]       = useState<Stats>({
    totalWorkouts: 0, totalCalories: 0, totalHours: 0, avgDiscipline: 0, streak: 0,
  })

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [pR, wR, mR, dR] = await Promise.all([
          supabase.from('profiles')
            .select('full_name,fitness_goal,daily_calorie_goal,is_premium,avatar_url')
            .eq('id', user.id).single(),
          supabase.from('workout_logs').select('id').eq('user_id', user.id),
          supabase.from('meals').select('calories').eq('user_id', user.id),
          supabase.from('detox_logs').select('streak_current').eq('user_id', user.id)
            .eq('status', 'active').order('streak_current', { ascending: false }).limit(1),
        ])

        setProfile({ ...(pR.data as Profile), email: user.email ?? '' })

        const workouts = (wR.data ?? []).length
        const totalKcal = (mR.data ?? []).reduce((s, x) => s + (x.calories ?? 0), 0)
        setStats({
          totalWorkouts:  workouts,
          totalCalories:  Math.round(totalKcal),
          totalHours:     Math.round(workouts * 0.75),
          avgDiscipline:  workouts > 0 ? Math.min(Math.round(60 + workouts * 2), 100) : 0,
          streak:         dR.data?.[0]?.streak_current ?? 0,
        })
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [supabase])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const name = profile?.full_name?.split(' ')[0] ?? 'Champion'

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: FONT, color: W, paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ padding: '52px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: W }}>Profile</h1>
          {profile?.is_premium && (
            <div style={{ padding: '4px 8px', borderRadius: 8, background: L, color: '#000', fontSize: 10, fontWeight: 800, letterSpacing: '0.05em' }}>
              PRO
            </div>
          )}
        </div>
        <button type="button" onClick={handleSignOut}
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: G2, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <Settings size={18} color={G1} />
        </button>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Avatar + Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: `${L}15`, border: `2px solid ${L}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={28} color={L} />
              </div>
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 24, height: 24, borderRadius: '50%',
                background: G2, border: `2px solid ${BG}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Camera size={11} color={G1} />
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {loading
                ? <><Sk w={120} h={22} /><div style={{ marginTop: 6 }}><Sk w={160} h={14} /></div></>
                : <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: W, fontWeight: 800, fontSize: 20 }}>{name}</span>
                      <Zap size={16} color={L} fill={L} />
                    </div>
                    <div style={{ color: G1, fontSize: 12, marginBottom: 8 }}>
                      {profile?.email}
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 20,
                      background: '#FF6B3510', border: '1px solid #FF6B3530',
                    }}>
                      <Flame size={11} color="#FF6B35" fill="#FF6B35" />
                      <span style={{ color: '#FF6B35', fontSize: 11, fontWeight: 600 }}>
                        {stats.streak} Day Streak
                      </span>
                    </div>
                  </>
              }
            </div>
          </div>

          {/* Goal badge */}
          {!loading && profile?.fitness_goal && (
            <div style={{
              marginTop: 16, padding: '10px 14px', borderRadius: 14,
              background: G2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ color: G1, fontSize: 12 }}>Current Goal</span>
              <span style={{ color: L, fontWeight: 600, fontSize: 12 }}>
                {GOAL_LABELS[profile.fitness_goal] ?? profile.fitness_goal}
              </span>
            </div>
          )}
        </motion.div>

        {/* Premium CTA */}
        {!loading && !profile?.is_premium && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '24px', borderRadius: 28,
              background: `linear-gradient(135deg, ${L} 0%, #88CC00 100%)`,
              position: 'relative', overflow: 'hidden', boxShadow: `0 12px 32px ${L}30`
            }}
          >
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', filter: 'blur(30px)' }} />
            <Zap size={32} color="#000" fill="#000" style={{ marginBottom: 16, opacity: 0.9 }} />
            <h3 style={{ color: '#000', fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Unlock Zynapse Pro</h3>
            <p style={{ color: 'rgba(0,0,0,0.7)', fontSize: 13, lineHeight: 1.5, marginBottom: 20, fontWeight: 500 }}>
              Get unlimited AI coaching, advanced meal analytics, and custom workout plans.
            </p>
            <Link href="/profile?upgrade=1" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 14, background: '#000', color: L, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
              Upgrade Now
            </Link>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: G1, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>
              YOUR STATS
            </span>
            <button type="button" style={{ background: 'none', border: 'none', color: L, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
              View All
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Workouts',      val: loading ? '—' : stats.totalWorkouts.toString(), sub: 'Total',        icon: Dumbbell, color: L },
              { label: 'Calories',      val: loading ? '—' : stats.totalCalories.toLocaleString(), sub: 'Total Burned', icon: Flame, color: '#FF6B35' },
              { label: 'Hours',         val: loading ? '—' : stats.totalHours.toString(), sub: 'Active',       icon: Clock, color: '#00D4FF' },
              { label: 'Discipline',    val: loading ? '—' : stats.avgDiscipline.toString(), sub: 'Avg Score',    icon: Zap, color: '#A78BFA' },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: W, lineHeight: 1, marginBottom: 4 }}>
                    {s.val}
                  </div>
                  <div style={{ color: G1, fontSize: 9, marginBottom: 2 }}>{s.label}</div>
                  <div style={{ color: '#333', fontSize: 9 }}>{s.sub}</div>
                  <Icon size={14} color={s.color} style={{ marginTop: 6 }} />
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, padding: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: G1, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>
              ACHIEVEMENTS
            </span>
            <button type="button" style={{ background: 'none', border: 'none', color: L, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
              View All
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {ACHIEVEMENTS.map((a, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: a.unlocked ? `${a.color}15` : G2,
                  border: `1.5px solid ${a.unlocked ? `${a.color}40` : BD}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  opacity: a.unlocked ? 1 : 0.4,
                }}>
                  {a.icon}
                </div>
                <span style={{
                  color: a.unlocked ? G1 : '#333',
                  fontSize: 9, textAlign: 'center',
                  whiteSpace: 'pre-line', lineHeight: 1.3,
                }}>
                  {a.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ background: C, border: `1px solid ${BD}`, borderRadius: 24, overflow: 'hidden' }}
        >
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BD}` }}>
            <span style={{ color: G1, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>
              SETTINGS
            </span>
          </div>

          {[
            { label: 'Account',       icon: User, href: '#' },
            { label: 'Preferences',   icon: Settings, href: '#' },
            { label: 'Notifications', icon: Bell, href: '#' },
            { label: 'Help & Support',icon: HelpCircle, href: '#' },
          ].map((item, i, arr) => {
            const Icon = item.icon
            return (
              <button key={item.label} type="button"
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', padding: '16px 20px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${BD}` : 'none',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: FONT,
                  textAlign: 'left',
                }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: G2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={16} color={G1} />
                </div>
                <span style={{ color: W, fontSize: 14, fontWeight: 500, flex: 1 }}>{item.label}</span>
                <ChevronRight size={16} color="#333" />
              </button>
            )
          })}
        </motion.div>

        {/* Sign out */}
        <motion.button
          type="button"
          onClick={handleSignOut}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '16px', borderRadius: 20,
            background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)',
            color: '#FF3B30', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: FONT,
          }}>
          <LogOut size={16} />
          Sign Out
        </motion.button>

      </div>
    </div>
  )
}
