'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

import {
  Zap,
  ChevronRight,
  Dumbbell,
  Send,
  Apple,
  Moon,
  Heart,
  Lock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

// ============================================================
// TOKENS
// ============================================================

const L = '#AAFF00'
const P = '#A78BFA'

const BG = '#080808'
const C = '#0D0D0D'
const BD = '#1A1A1A'

const W = '#FFFFFF'
const G1 = '#777777'
const G2 = '#2A2A2A'

const FONT = "'Plus Jakarta Sans','Inter',sans-serif"

// ============================================================
// TYPES
// ============================================================

type Msg = {
  role: 'user' | 'ai'
  text: string
  ts: number
}

type Prof = {
  full_name: string
  fitness_goal: string
  daily_calorie_goal: number
  is_premium: boolean
}

type Stats = {
  kcal: number
  workouts: number
  streak: number
  focusMins: number
}

// ============================================================
// RECOMMENDATIONS
// ============================================================

const RECS: Record<
  string,
  {
    icon: typeof Dumbbell
    color: string
    bg: string
    category: string
    action: string
    href: string
  }[]
> = {
  build_muscle: [
    {
      icon: Dumbbell,
      color: L,
      bg: `${L}10`,
      category: 'Workout',
      action: 'Push Day — Chest focus. 4×8 Bench Press to start.',
      href: '/workout',
    },
    {
      icon: Apple,
      color: '#FF6B35',
      bg: 'rgba(255,107,53,0.08)',
      category: 'Nutrition',
      action: 'Increase protein by 20g. Add a chicken breast at lunch.',
      href: '/food',
    },
    {
      icon: Moon,
      color: '#60A5FA',
      bg: 'rgba(96,165,250,0.08)',
      category: 'Recovery',
      action: 'Target 7.5h sleep tonight. Muscle grows while you rest.',
      href: '/profile',
    },
    {
      icon: Heart,
      color: P,
      bg: `${P}10`,
      category: 'Mindset',
      action: '10 min meditation before bed. Discipline builds in silence.',
      href: '/coach',
    },
  ],
}

// ============================================================
// PULSE RING
// ============================================================

function PulseRing({
  color,
  size,
}: {
  color: string
  size: number
}) {
  return (
    <>
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size + i * 16,
            height: size + i * 16,
            border: `1px solid ${color}`,
            opacity: 0,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            opacity: [0, 0.4, 0],
            scale: [0.9, 1.1, 1.1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.5,
            delay: i * 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  )
}

// ============================================================
// TYPING DOTS
// ============================================================

function TypingDots() {
  return (
    <div
      className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm"
      style={{
        background: '#161616',
        width: 'fit-content',
      }}
    >
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{
            y: [0, -4, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.9,
            delay: i * 0.18,
          }}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: P,
          }}
        />
      ))}
    </div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function CoachPage() {
  const supabase = createClient()

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)

  const [profile, setProfile] = useState<Prof | null>(null)

  const [stats, setStats] = useState<Stats>({
    kcal: 0,
    workouts: 0,
    streak: 0,
    focusMins: 0,
  })

  const [brief, setBrief] = useState('')
  const [briefLoading, setBriefLoading] = useState(true)

  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [aiTyping, setAiTyping] = useState(false)

  const [msgCount, setMsgCount] = useState(0)

  const FREE_LIMIT = 5

  // ============================================================
  // LOAD
  // ============================================================

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const today = new Date().toISOString().split('T')[0]

      const [pR, mR, wR] = await Promise.all([
        supabase
          .from('profiles')
          .select(
            'full_name,fitness_goal,daily_calorie_goal,is_premium'
          )
          .eq('id', user.id)
          .single(),

        supabase
          .from('meals')
          .select('calories')
          .eq('user_id', user.id)
          .gte('logged_at', `${today}T00:00:00`),

        supabase
          .from('workout_logs')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`),
      ])

      const p = pR.data as Prof | null
      const m = mR.data ?? []

      setProfile(p)

      setStats({
        kcal: m.reduce((s, x) => s + (x.calories ?? 0), 0),
        workouts: (wR.data ?? []).length,
        streak: 7,
        focusMins: 0,
      })

      setBrief(
        'Your recovery is solid. Push intensity today and stay disciplined with nutrition.'
      )

      setBriefLoading(false)

      setLoading(false)
    }

    load()
  }, [supabase])

  // ============================================================
  // SCROLL
  // ============================================================

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, aiTyping])

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const send = useCallback(async () => {
    const text = input.trim()

    if (!text || aiTyping) return

    if (!profile?.is_premium && msgCount >= FREE_LIMIT) return

    const userMsg: Msg = {
      role: 'user',
      text,
      ts: Date.now(),
    }

    setMessages(prev => [...prev, userMsg])

    setInput('')
    setAiTyping(true)

    setMsgCount(n => n + 1)

    try {
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          context: {
            kcal: stats.kcal,
            goal: profile?.daily_calorie_goal,
            workouts: stats.workouts,
            streak: stats.streak,
          },
        }),
      })

      const j = await r.json()

      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text:
            j.reply ??
            'Locked in. Stay disciplined today.',
          ts: Date.now(),
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: 'Connection issue. Try again.',
          ts: Date.now(),
        },
      ])
    } finally {
      setAiTyping(false)
    }
  }, [input, aiTyping, profile, msgCount, stats])

  // ============================================================

  const QUICK = [
    'What should I eat today?',
    'Am I recovering well?',
    'Motivate me right now.',
    'Review my progress.',
  ]

  const name =
    profile?.full_name?.split(' ')[0] ?? 'Champion'

  const recs = RECS.build_muscle

  const atLimit =
    !profile?.is_premium && msgCount >= FREE_LIMIT

  // ============================================================

  return (
    <div
      style={{
        background: BG,
        minHeight: '100vh',
        fontFamily: FONT,
        color: W,
      }}
    >
      <div
        style={{
          padding: '52px 20px 24px',
        }}
      >
        <div
          style={{
            color: G1,
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          Your personal
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            AI Coach
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              background:
                'rgba(167,139,250,0.08)',
              border:
                '1px solid rgba(167,139,250,0.2)',
            }}
          >
            <motion.div
              animate={{
                opacity: [1, 0.3, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
              }}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#00CC55',
              }}
            />

            <span
              style={{
                color: P,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Active
            </span>
          </div>
        </div>

        <p
          style={{
            color: G1,
            fontSize: 13,
            marginTop: 6,
          }}
        >
          Performance coach · Powered by Groq
        </p>
      </div>

      <div
        style={{
          padding: '0 20px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* STATUS CARD */}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderRadius: 24,
            padding: 20,
            position: 'relative',
            overflow: 'hidden',
            background:
              'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(167,139,250,0.03) 100%)',
            border:
              '1px solid rgba(167,139,250,0.15)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                position: 'relative',
                width: 52,
                height: 52,
              }}
            >
              <PulseRing color={P} size={52} />

              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: `${P}18`,
                  border: `1.5px solid ${P}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap
                  size={22}
                  color={P}
                  fill={P}
                />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: W,
                  fontWeight: 600,
                  fontSize: 15,
                  marginBottom: 4,
                }}
              >
                {loading
                  ? 'Loading...'
                  : `Coaching ${name}`}
              </div>

              <div
                style={{
                  color: G1,
                  fontSize: 12,
                }}
              >
                Analyzing your data · Optimizing your plan
              </div>
            </div>
          </div>
        </motion.div>

        {/* BRIEF */}

        <div
          style={{
            background: C,
            border: `1px solid ${BD}`,
            borderRadius: 24,
            padding: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 14,
            }}
          >
            <Sparkles size={13} color={P} />

            <span
              style={{
                color: P,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.12em',
              }}
            >
              TODAY&apos;S PLAN
            </span>
          </div>

          {briefLoading ? (
            <p style={{ color: G1 }}>
              Loading...
            </p>
          ) : (
            <p
              style={{
                color: '#CCCCCC',
                fontSize: 14,
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {brief}
            </p>
          )}
        </div>

        {/* RECOMMENDATIONS */}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {recs.map((rec, i) => {
            const Icon = rec.icon

            return (
              <Link
                key={i}
                href={rec.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: 20,
                  background: C,
                  border: `1px solid ${BD}`,
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: rec.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    size={17}
                    color={rec.color}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: rec.color,
                      fontSize: 10,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {rec.category.toUpperCase()}
                  </div>

                  <div
                    style={{
                      color: '#CCCCCC',
                      fontSize: 13,
                    }}
                  >
                    {rec.action}
                  </div>
                </div>

                <ChevronRight
                  size={15}
                  color={G2}
                />
              </Link>
            )
          })}
        </div>

        {/* CHAT */}

        <div
          style={{
            background: C,
            border: `1px solid ${BD}`,
            borderRadius: 24,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${BD}`,
            }}
          >
            <div
              style={{
                color: W,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Ask Your Coach
            </div>
          </div>

          <div
            style={{
              padding: 16,
              maxHeight: 320,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  background: '#161616',
                  padding: '12px 14px',
                  borderRadius: 18,
                  maxWidth: '85%',
                }}
              >
                Hey {name} 👋 What do you want to improve today?
              </div>
            )}

            <AnimatePresence>
              {messages.map(msg => (
                <motion.div
                  key={msg.ts}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  style={{
                    display: 'flex',
                    justifyContent:
                      msg.role === 'user'
                        ? 'flex-end'
                        : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '12px 14px',
                      borderRadius: 18,
                      background:
                        msg.role === 'user'
                          ? `${P}20`
                          : '#161616',
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {aiTyping && <TypingDots />}

            <div ref={chatEndRef} />
          </div>

          {messages.length === 0 && (
            <div
              style={{
                padding: '0 12px 12px',
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
              }}
            >
              {QUICK.map(q => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q)
                    inputRef.current?.focus()
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 12,
                    background: G2,
                    color: '#aaa',
                    border: 'none',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {atLimit && (
            <div
              style={{
                padding: 16,
                color: '#CCCCCC',
              }}
            >
              Daily limit reached.
            </div>
          )}

          <div
            style={{
              padding: '8px 12px 14px',
              display: 'flex',
              gap: 8,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e =>
                setInput(e.target.value)
              }
              onKeyDown={e =>
                e.key === 'Enter' && send()
              }
              placeholder="Ask anything about your health..."
              disabled={atLimit || aiTyping}
              style={{
                flex: 1,
                background: G2,
                border: `1px solid ${BD}`,
                borderRadius: 14,
                padding: '12px 14px',
                color: W,
                outline: 'none',
              }}
            />

            <button
              onClick={send}
              disabled={
                !input.trim() ||
                aiTyping ||
                atLimit
              }
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                border: 'none',
                background:
                  input.trim() &&
                  !aiTyping &&
                  !atLimit
                    ? P
                    : G2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send
                size={16}
                color={
                  input.trim()
                    ? '#fff'
                    : '#555'
                }
              />
            </button>
          </div>
        </div>

        {/* PREMIUM */}

        {!loading && !profile?.is_premium && (
          <Link
            href="/profile?upgrade=1"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              borderRadius: 24,
              background:
                'linear-gradient(135deg, rgba(170,255,0,0.07) 0%, rgba(170,255,0,0.03) 100%)',
              border: `1px solid ${L}25`,
              textDecoration: 'none',
            }}
          >
            <div>
              <div
                style={{
                  color: L,
                  fontWeight: 700,
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                Unlock Full AI Coaching
              </div>

              <div
                style={{
                  color: G1,
                  fontSize: 12,
                }}
              >
                Unlimited messages · Advanced insights · 199 BDT/mo
              </div>
            </div>

            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: L,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap
                size={18}
                color="#000"
                fill="#000"
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}