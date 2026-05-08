'use client'

// ============================================================
//  ZYNAPSE — SIGNUP PAGE
//  File location: app/(auth)/signup/page.tsx
// ============================================================

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Dumbbell,
  Apple,
  Target,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─── Design Tokens ───────────────────────────────────────────
const LIME   = '#C8FF00'
const BG     = '#0A0A0A'
const CARD   = '#161616'
const BORDER = '#222222'
const MUTED  = '#666'
const SUB    = '#999'

const FEATURES = [
  { icon: Dumbbell, title: 'Track Workouts',   sub: 'Log, analyze and improve'    },
  { icon: Apple,    title: 'Smart Nutrition',   sub: 'AI-powered meal insights'    },
  { icon: Target,   title: 'Build Discipline',  sub: 'Detox, focus and grow'       },
]

// Password strength checker
function getPasswordStrength(pwd: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  if (pwd.length >= 8)          score++
  if (/[A-Z]/.test(pwd))        score++
  if (/[0-9]/.test(pwd))        score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score === 0) return { score: 0, label: '',        color: BORDER }
  if (score === 1) return { score: 1, label: 'Weak',    color: '#ff4444' }
  if (score === 2) return { score: 2, label: 'Fair',    color: '#ffaa00' }
  if (score === 3) return { score: 3, label: 'Good',    color: '#88cc00' }
  return              { score: 4, label: 'Strong',      color: LIME     }
}

// ============================================================
//  MAIN COMPONENT
// ============================================================
export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName]         = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading]           = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [success, setSuccess]           = useState(false)

  const strength = getPasswordStrength(password)

  // ── Auth Handlers ─────────────────────────────────────────

  async function handleGoogleSignup() {
    setGoogleLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) setError(error.message)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName || !email || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      // Show success — user needs to verify email
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success Screen ────────────────────────────────────────
  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: BG, fontFamily: "'Syne', 'Inter', sans-serif" }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');`}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(200,255,0,0.12)', border: `2px solid ${LIME}` }}
          >
            <CheckCircle2 size={40} color={LIME} />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Check your email!
          </h2>
          <p className="mb-6" style={{ color: SUB }}>
            We sent a verification link to{' '}
            <span className="text-white font-semibold">{email}</span>.
            Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold"
            style={{ background: LIME, color: BG }}
          >
            Back to Login <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    )
  }

  // ============================================================
  //  RENDER
  // ============================================================
  return (
    <div
      className="min-h-screen w-full flex"
      style={{ background: BG, fontFamily: "'Syne', 'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #1a1a1a inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }
      `}</style>

      {/* ── Left Panel ───────────────────────────────────────── */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] relative flex-col justify-between overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Body-Builder.png"
            alt="Zynapse fitness"
            fill
            className="object-cover object-center"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.95) 100%)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: '15%', left: '30%',
              width: 320, height: 320,
              borderRadius: '50%',
              border: '1.5px solid rgba(200,255,0,0.35)',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: '15%', left: '30%',
              width: 220, height: 220,
              borderRadius: '50%',
              border: '1.5px solid rgba(200,255,0,0.25)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        <div className="relative z-10 p-8">
          <div
            className="w-8 h-8 flex items-center justify-center rounded"
            style={{ background: LIME }}
          >
            <span className="text-black font-extrabold text-sm">Z</span>
          </div>
        </div>

        <div className="relative z-10 p-8 space-y-4">
          <div className="space-y-4 mb-6">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(200,255,0,0.12)' }}
                  >
                    <Icon size={18} color={LIME} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{f.title}</div>
                    <div className="text-xs" style={{ color: SUB }}>{f.sub}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div
            className="p-4 rounded-2xl"
            style={{
              background: 'rgba(22,22,22,0.85)',
              border: `1px solid ${BORDER}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(200,255,0,0.12)' }}
              >
                <Sparkles size={18} color={LIME} />
              </div>
              <div>
                <div className="text-sm font-bold mb-0.5" style={{ color: LIME }}>
                  AI-Powered
                </div>
                <div className="text-xs" style={{ color: SUB }}>
                  Your personal fitness companion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Signup Form ─────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto" style={{ background: BG }}>
        {/* Top bar */}
        <div className="flex items-center justify-between p-6">
          <div className="flex md:hidden items-center gap-2">
            <div
              className="w-8 h-8 flex items-center justify-center rounded"
              style={{ background: LIME }}
            >
              <span className="text-black font-extrabold text-sm">Z</span>
            </div>
            <span className="text-white font-bold text-lg">ZYNAPSE</span>
          </div>
          <div className="hidden md:block" />
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-xl"
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              color: '#ccc',
            }}
          >
            Log in
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm"
          >
            {/* Headline */}
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-white leading-tight mb-2">
                Start your
                <br />
                <span style={{ color: LIME }}>fitness journey</span>
              </h1>
              <p style={{ color: SUB }}>
                Create your free Zynapse account
              </p>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl mb-5"
                  style={{
                    background: 'rgba(255,80,80,0.1)',
                    border: '1px solid rgba(255,80,80,0.3)',
                  }}
                >
                  <AlertCircle size={16} color="#ff5050" className="flex-shrink-0" />
                  <span className="text-sm" style={{ color: '#ff5050' }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-semibold text-white transition-all mb-3 active:scale-95"
              style={{ background: CARD, border: `1.5px solid ${BORDER}`, opacity: googleLoading ? 0.7 : 1 }}
            >
              {googleLoading ? (
                <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: BORDER }} />
              <span className="text-xs" style={{ color: MUTED }}>or</span>
              <div className="flex-1 h-px" style={{ background: BORDER }} />
            </div>

            {/* Signup Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4 mb-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ccc' }}>
                  Full Name
                </label>
                <div
                  className="flex items-center gap-3 px-4 py-4 rounded-2xl"
                  style={{ background: CARD, border: `1.5px solid ${fullName ? LIME : BORDER}` }}
                >
                  <User size={17} color={fullName ? LIME : MUTED} />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ccc' }}>
                  Email
                </label>
                <div
                  className="flex items-center gap-3 px-4 py-4 rounded-2xl"
                  style={{ background: CARD, border: `1.5px solid ${email ? LIME : BORDER}` }}
                >
                  <Mail size={17} color={email ? LIME : MUTED} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ccc' }}>
                  Password
                </label>
                <div
                  className="flex items-center gap-3 px-4 py-4 rounded-2xl"
                  style={{ background: CARD, border: `1.5px solid ${password ? LIME : BORDER}` }}
                >
                  <Lock size={17} color={password ? LIME : MUTED} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600"
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((s) => !s)}>
                    {showPassword ? <EyeOff size={17} color={MUTED} /> : <Eye size={17} color={MUTED} />}
                  </button>
                </div>

                {/* Password strength bar */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex-1 h-1 rounded-full transition-all"
                          style={{
                            background: i <= strength.score ? strength.color : BORDER,
                          }}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <span className="text-xs" style={{ color: strength.color }}>
                        {strength.label} password
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-bold transition-all active:scale-95"
                style={{
                  background: loading ? '#a0cc00' : LIME,
                  color: BG,
                  opacity: loading ? 0.8 : 1,
                }}
              >
                {loading ? (
                  <>
                    <div
                      className="w-5 h-5 rounded-full border-2 animate-spin"
                      style={{ borderColor: BG, borderTopColor: 'transparent' }}
                    />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="text-sm text-center mb-6" style={{ color: SUB }}>
              Already have an account?{' '}
              <Link href="/login" className="font-bold" style={{ color: LIME }}>
                Log in
              </Link>
            </p>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck size={16} color={MUTED} />
              <span className="text-xs" style={{ color: MUTED }}>
                Your data is secure with us
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}