'use client'

// ============================================================
//  ZYNAPSE — LOGIN PAGE
//  File location: app/(auth)/login/page.tsx
//
//  Features:
//  ✅ Google OAuth (one click)
//  ✅ Email + Password login
//  ✅ Show/hide password toggle
//  ✅ Forgot password
//  ✅ Error messages
//  ✅ Loading states
//  ✅ Split layout (image left, form right)
//  ✅ Fully responsive (stacks on mobile)
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
  Dumbbell,
  Apple,
  Target,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─── Design Tokens ───────────────────────────────────────────
const LIME   = '#C8FF00'
const BG     = '#0A0A0A'
const CARD   = '#161616'
const BORDER = '#222222'
const MUTED  = '#666'
const SUB    = '#999'

// ─── Feature List (left panel) ───────────────────────────────
const FEATURES = [
  {
    icon: Dumbbell,
    title: 'Track Workouts',
    sub: 'Log, analyze and improve',
  },
  {
    icon: Apple,
    title: 'Smart Nutrition',
    sub: 'AI-powered meal insights',
  },
  {
    icon: Target,
    title: 'Build Discipline',
    sub: 'Detox, focus and grow',
  },
]

// ============================================================
//  MAIN COMPONENT
// ============================================================
export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isDark, setIsDark]         = useState(true)

  // UI state
  const [loading, setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)

  // ── Auth Handlers ─────────────────────────────────────────

  async function handleGoogleLogin() {
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

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Check if onboarding is done
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single()

        if (profile?.onboarding_completed) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  //  RENDER
  // ============================================================
  return (
    <div
      className="min-h-screen w-full flex"
      style={{
        background: BG,
        fontFamily: "'Syne', 'Inter', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #1a1a1a inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          LEFT PANEL — Hero image + features
          Hidden on mobile (shows only on md+)
      ══════════════════════════════════════════════════════ */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] relative flex-col justify-between overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/Body-Builder.png"
            alt="Zynapse fitness"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.95) 100%)',
            }}
          />
          {/* Lime glow rings — matching your image */}
          <div
            className="absolute"
            style={{
              top: '15%',
              left: '30%',
              width: 320,
              height: 320,
              borderRadius: '50%',
              border: '1.5px solid rgba(200,255,0,0.35)',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: '15%',
              left: '30%',
              width: 220,
              height: 220,
              borderRadius: '50%',
              border: '1.5px solid rgba(200,255,0,0.25)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* Top logo */}
        <div className="relative z-10 p-8">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 flex items-center justify-center rounded"
              style={{ background: LIME }}
            >
              <span className="text-black font-extrabold text-sm">Z</span>
            </div>
          </div>
        </div>

        {/* Bottom content — features + AI card */}
        <div className="relative z-10 p-8 space-y-4">
          {/* Feature list */}
          <div className="space-y-4 mb-6">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(200,255,0,0.12)' }}
                  >
                    <Icon size={18} color={LIME} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {f.title}
                    </div>
                    <div className="text-xs" style={{ color: SUB }}>
                      {f.sub}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* AI-Powered card */}
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
                <div
                  className="text-sm font-bold mb-0.5"
                  style={{ color: LIME }}
                >
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

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL — Login form
      ══════════════════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col min-h-screen overflow-y-auto"
        style={{ background: BG }}
      >
        {/* Top bar — logo (mobile only) + theme toggle */}
        <div className="flex items-center justify-between p-6">
          {/* Logo — only shows on mobile */}
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

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setIsDark((d) => !d)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              color: '#ccc',
            }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Form area */}
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
                Welcome back
                <br />
                to your{' '}
                <span style={{ color: LIME }}>best self</span>
              </h1>
              <p style={{ color: SUB }}>
                Log in to continue your fitness journey
              </p>
            </div>

            {/* ── Error Banner ────────────────────────────── */}
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
                  <span className="text-sm" style={{ color: '#ff5050' }}>
                    {error}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Google Button ────────────────────────────── */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-semibold text-white transition-all mb-3 active:scale-95"
              style={{
                background: CARD,
                border: `1.5px solid ${BORDER}`,
                opacity: googleLoading ? 0.7 : 1,
              }}
            >
              {googleLoading ? (
                <div
                  className="w-5 h-5 rounded-full border-2 animate-spin"
                  style={{ borderColor: '#fff', borderTopColor: 'transparent' }}
                />
              ) : (
                /* Google G logo SVG */
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            {/* ── Email button (toggles form) ───────────────── */}
            {!showEmailForm && (
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-semibold text-white transition-all mb-6 active:scale-95"
                style={{
                  background: CARD,
                  border: `1.5px solid ${BORDER}`,
                }}
              >
                <Mail size={18} color="#aaa" />
                Continue with Email
              </button>
            )}

            {/* ── OR divider ───────────────────────────────── */}
            {showEmailForm && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: BORDER }} />
                <span className="text-xs" style={{ color: MUTED }}>or</span>
                <div className="flex-1 h-px" style={{ background: BORDER }} />
              </div>
            )}

            {/* ── Email / Password Form ─────────────────────── */}
            <AnimatePresence>
              {showEmailForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleEmailLogin}
                  className="space-y-4 mb-6 overflow-hidden"
                >
                  {/* Email field */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: '#ccc' }}
                    >
                      Email
                    </label>
                    <div
                      className="flex items-center gap-3 px-4 py-4 rounded-2xl transition-all"
                      style={{
                        background: CARD,
                        border: `1.5px solid ${email ? LIME : BORDER}`,
                      }}
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

                  {/* Password field */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: '#ccc' }}
                    >
                      Password
                    </label>
                    <div
                      className="flex items-center gap-3 px-4 py-4 rounded-2xl transition-all"
                      style={{
                        background: CARD,
                        border: `1.5px solid ${password ? LIME : BORDER}`,
                      }}
                    >
                      <Lock size={17} color={password ? LIME : MUTED} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="flex-shrink-0"
                      >
                        {showPassword ? (
                          <EyeOff size={17} color={MUTED} />
                        ) : (
                          <Eye size={17} color={MUTED} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Forgot password */}
                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm font-semibold"
                      style={{ color: LIME }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Log In button */}
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
                          style={{
                            borderColor: BG,
                            borderTopColor: 'transparent',
                          }}
                        />
                        Logging in...
                      </>
                    ) : (
                      <>
                        Log In <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* ── Or divider (when email form hidden) ──────── */}
            {!showEmailForm && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: BORDER }} />
                <span className="text-xs" style={{ color: MUTED }}>or</span>
                <div className="flex-1 h-px" style={{ background: BORDER }} />
              </div>
            )}

            {/* ── Sign up link ──────────────────────────────── */}
            <p className="text-sm text-center mb-6" style={{ color: SUB }}>
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-bold"
                style={{ color: LIME }}
              >
                Sign up
              </Link>
            </p>

            {/* ── Security badge ────────────────────────────── */}
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