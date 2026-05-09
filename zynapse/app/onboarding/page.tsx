'use client'

// ============================================================
//  ZYNAPSE — ONBOARDING PAGE (WITH REAL IMAGES)
//  File location: app/onboarding/page.tsx
//
//  BEFORE THIS WORKS — put these images in /public/images/:
//  ✅ Body-Builder.png  → used on splash screen
//  ✅ Ectomorph.png     → used on body type screen
//  ✅ Mesomorph.png     → used on body type screen
//  ✅ Endomorph.png     → used on body type screen
// ============================================================

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  ArrowLeft,
  Rocket,
  Dumbbell,
  Flame,
  TrendingUp,
  Zap,
  Leaf,
  Sofa,
  Bike,
  CheckCircle2,
  ChevronDown,
  ArrowLeftRight,
  User,
  Timer,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateGoals } from '@/lib/personalization/calculate-goals'

// ─── Types ───────────────────────────────────────────────────
type FitnessGoal =
  | 'build_muscle'
  | 'lose_fat'
  | 'lean_bulk'
  | 'athletic_body'
  | 'maintain_fitness'

type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph'

type Lifestyle =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active'

type Gender = 'male' | 'female' | 'other'
type UnitSystem = 'metric' | 'imperial'

type OnboardingData = {
  fitness_goal: FitnessGoal | null
  height_cm: number
  weight_kg: number
  age: number
  gender: Gender | null
  lifestyle: Lifestyle | null
  body_type: BodyType | null
  unit_system: UnitSystem
}

type CalculatedGoals = {
  daily_calorie_goal: number
  daily_protein_goal_g: number
  daily_carb_goal_g: number
  daily_fat_goal_g: number
}

// ─── Animation Variants ──────────────────────────────────────
const slideVariants: Variants = {
  enter: { x: 60, opacity: 0 },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: {
    x: -60,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

const fadeUp: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  }),
}

// ─── Constants ───────────────────────────────────────────────
const GOALS: {
  id: FitnessGoal
  label: string
  sub: string
  icon: React.ElementType
}[] = [
  {
    id: 'build_muscle',
    label: 'Build Muscle',
    sub: 'Gain strength and size',
    icon: Dumbbell,
  },
  {
    id: 'lose_fat',
    label: 'Lose Fat',
    sub: 'Burn fat and get lean',
    icon: Flame,
  },
  {
    id: 'lean_bulk',
    label: 'Lean Bulk',
    sub: 'Build muscle and stay lean',
    icon: TrendingUp,
  },
  {
    id: 'athletic_body',
    label: 'Athletic Body',
    sub: 'Improve performance and agility',
    icon: Zap,
  },
  {
    id: 'maintain_fitness',
    label: 'Maintain Fitness',
    sub: 'Stay healthy and fit',
    icon: Leaf,
  },
]

const LIFESTYLES: {
  id: Lifestyle
  label: string
  sub: string
  icon: React.ElementType
}[] = [
  {
    id: 'sedentary',
    label: 'Sedentary',
    sub: 'Little or no exercise',
    icon: Sofa,
  },
  {
    id: 'lightly_active',
    label: 'Lightly Active',
    sub: '1-3 days per week',
    icon: User,
  },
  {
    id: 'moderately_active',
    label: 'Moderately Active',
    sub: '3-5 days per week',
    icon: Bike,
  },
  {
    id: 'very_active',
    label: 'Very Active',
    sub: '6-7 days per week',
    icon: Dumbbell,
  },
  {
    id: 'extra_active',
    label: 'Extra Active',
    sub: 'Physical job or intense training',
    icon: Timer,
  },
]

// ── Body type cards with REAL image paths ──────────────────────
const BODY_TYPES: {
  id: BodyType
  label: string
  sub: string
  image: string       // ← path inside /public/images/
}[] = [
  {
    id: 'ectomorph',
    label: 'Ectomorph',
    sub: 'Lean · Hard gainer',
    image: '/images/Ectomorph.png',
  },
  {
    id: 'mesomorph',
    label: 'Mesomorph',
    sub: 'Athletic · Naturally fit',
    image: '/images/Mesomorph.png',
  },
  {
    id: 'endomorph',
    label: 'Endomorph',
    sub: 'Stronger · Builds easier',
    image: '/images/Endomorph.png',
  },
]

const COMPLETION_STEPS = [
  'Analyzing your data',
  'Creating your plan',
  'Setting up your goals',
  'Building your workspace',
]

const LIME = '#C8FF00'
const BG = '#0A0A0A'
const CARD = '#161616'
const BORDER = '#2A2A2A'
const MUTED = '#888'
const DIM = '#444'

// ============================================================
//  MAIN COMPONENT
// ============================================================
export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [savedGoals, setSavedGoals] = useState<CalculatedGoals | null>(null)

  const [data, setData] = useState<OnboardingData>({
    fitness_goal: null,
    height_cm: 170,
    weight_kg: 70,
    age: 22,
    gender: null,
    lifestyle: null,
    body_type: null,
    unit_system: 'metric',
  })

  // Imperial display values
  const [heightFt, setHeightFt] = useState(5)
  const [heightIn, setHeightIn] = useState(8)

  const totalSteps = 5
  const progress = step === 0 ? 0 : (step / totalSteps) * 100

  // ── Helpers ─────────────────────────────────────────────────
  function toggleUnits() {
    setData((prev) => ({
      ...prev,
      unit_system: prev.unit_system === 'metric' ? 'imperial' : 'metric',
    }))
  }

  function handleHeightImperial(ft: number, inches: number) {
    setHeightFt(ft)
    setHeightIn(inches)
    setData((prev) => ({
      ...prev,
      height_cm: Math.round(ft * 30.48 + inches * 2.54),
    }))
  }

  function back() {
    if (step > 0) setStep((s) => s - 1)
  }

  function next() {
    if (step < 5) setStep((s) => s + 1)
  }

  function canContinue(): boolean {
    if (step === 1) return !!data.fitness_goal
    if (step === 2) return !!data.gender && data.age > 0
    if (step === 3) return !!data.lifestyle
    if (step === 4) return !!data.body_type
    return true
  }

  // ── Final Submission ─────────────────────────────────────────
  async function handleComplete() {
    setStep(5)

    // Simulate completion animation steps
    for (let i = 0; i < COMPLETION_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 800))
      setCompletedSteps((prev) => [...prev, i])
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Calculate goals using rule-based engine (no AI cost)
      const goals = calculateGoals({
        weight_kg: data.weight_kg,
        height_cm: data.height_cm,
        age: data.age,
        gender: data.gender ?? 'male',
        lifestyle: data.lifestyle ?? 'moderately_active',
        fitness_goal: data.fitness_goal ?? 'maintain_fitness',
        body_type: data.body_type ?? 'mesomorph',
      })

      // Save to state so we can show calorie goal in the UI
      setSavedGoals(goals)

      // Save to Supabase
      await supabase.from('profiles').upsert({
        id: user.id,
        fitness_goal: data.fitness_goal,
        height_cm: data.height_cm,
        weight_kg: data.weight_kg,
        age: data.age,
        gender: data.gender,
        lifestyle: data.lifestyle,
        body_type: data.body_type,
        unit_system: data.unit_system,
        onboarding_completed: true,
        ...goals,
      })

      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error('Onboarding save error:', err)
    }
  }

  // ============================================================
  //  RENDER
  // ============================================================
  return (
    <div
      className="min-h-[100svh] w-full flex flex-col items-start justify-start overflow-hidden"
      style={{ background: BG, fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      {/* Google Fonts - Space Grotesk for modern, classy look */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Progress Bar */}
      {step > 0 && (
        <div
          className="fixed top-0 left-0 right-0 z-50 h-1"
          style={{ background: '#1A1A1A' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: LIME }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Back Button */}
      {step > 0 && step < 5 && (
        <button
          onClick={back}
          className="fixed top-4 left-5 z-50 text-sm font-medium flex items-center gap-2"
          style={{ color: MUTED }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}

      {/* Skip Button */}
      {step > 0 && step < 5 && (
        <button
          onClick={next}
          className="fixed top-4 right-5 z-50 text-sm font-medium"
          style={{ color: MUTED }}
        >
          Skip
        </button>
      )}

      {/* Step Container */}
      <div className="w-full h-[100svh] px-0 py-0 relative overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════
              STEP 0 — SPLASH
          ══════════════════════════════════════ */}
          {step === 0 && (
            <motion.div
              key="splash"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-start"
            >
              {/* ── HERO IMAGE — body-builder-2.png ─────────────────
                  Full-screen splash with top-left logo and bottom text overlay.
              ─────────────────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="w-full relative overflow-hidden mb-0"
                style={{ height: '100svh', maxHeight: '100svh' }}
              >
                <Image
                  src="/images/body-builder-2.png"
                  alt="Zynapse fitness"
                  fill
                  className="object-cover object-center"
                  priority
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(10,10,10,0.22) 0%, rgba(10,10,10,0.45) 35%, rgba(10,10,10,0.95) 100%)',
                  }}
                />
                <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.4)' }} />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 35%, rgba(200,255,0,0.12), transparent 24%)',
                  }}
                />

                <div className="absolute inset-0 px-6 pt-6 pb-8 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div
                      className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold"
                      style={{ background: 'rgba(0,0,0,0.45)', color: '#C8FF00' }}
                    >
                      <Zap size={16} /> ZYNAPSE
                    </div>
                  </div>

                  <div className="mt-auto space-y-8">
                    <div className="max-w-xl text-white">
                      <h1 className="text-3xl leading-tight tracking-tight font-extrabold sm:text-4xl">
                        Your AI-Powered{' '}
                        <span style={{ color: LIME }}>Fitness</span>{' '}
                        Companion
                      </h1>
                      <p className="mt-3 text-sm leading-6 text-[#E6E6E6] sm:text-base">
                        Track. Train. Transform.
                        <br />
                        All in one intelligent ecosystem.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-center gap-2">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="rounded-full transition-all"
                            style={{
                              width: i === 0 ? 24 : 8,
                              height: 8,
                              background: i === 0 ? LIME : '#333',
                            }}
                          />
                        ))}
                      </div>
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        onClick={next}
                        className="mx-auto w-full max-w-[320px] py-4 rounded-full flex items-center justify-center gap-3 text-base font-bold transition-transform active:scale-95"
                        style={{ background: LIME, color: BG }}
                      >
                        Get Started <ArrowRight size={20} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              STEP 1 — MAIN GOAL
          ══════════════════════════════════════ */}
          {step === 1 && (
            <motion.div
              key="goal"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-[100svh] flex flex-col overflow-y-auto"
            >
              <div className="px-6 py-12 flex flex-col justify-between h-full">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-8"
              >
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  What is your{' '}
                  <span style={{ color: LIME }}>main goal?</span>
                </h2>
                <p style={{ color: MUTED }}>
                  We&apos;ll personalize everything based on your goal.
                </p>
              </motion.div>

              {/* Goal Grid — first 4 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {GOALS.slice(0, 4).map((goal, i) => {
                  const Icon = goal.icon
                  const isSelected = data.fitness_goal === goal.id
                  return (
                    <motion.button
                      key={goal.id}
                      custom={i + 1}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          fitness_goal: goal.id,
                        }))
                      }
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl text-center transition-all"
                      style={{
                        background: isSelected
                          ? 'rgba(200,255,0,0.12)'
                          : CARD,
                        border: `2px solid ${isSelected ? LIME : BORDER}`,
                      }}
                    >
                      <Icon
                        size={24}
                        color={isSelected ? LIME : '#666'}
                      />
                      <span
                        className="text-sm font-bold"
                        style={{ color: isSelected ? '#fff' : '#ccc' }}
                      >
                        {goal.label}
                      </span>
                      <span className="text-xs" style={{ color: '#666' }}>
                        {goal.sub}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              {/* Goal — last full width */}
              {(() => {
                const goal = GOALS[4]
                const Icon = goal.icon
                const isSelected = data.fitness_goal === goal.id
                return (
                  <motion.button
                    custom={5}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        fitness_goal: goal.id,
                      }))
                    }
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl mb-8 transition-all"
                    style={{
                      background: isSelected
                        ? 'rgba(200,255,0,0.12)'
                        : CARD,
                      border: `2px solid ${isSelected ? LIME : BORDER}`,
                    }}
                  >
                    <Icon size={22} color={isSelected ? LIME : '#666'} />
                    <div className="text-left">
                      <div
                        className="text-sm font-bold"
                        style={{ color: isSelected ? '#fff' : '#ccc' }}
                      >
                        {goal.label}
                      </div>
                      <div className="text-xs" style={{ color: '#666' }}>
                        {goal.sub}
                      </div>
                    </div>
                  </motion.button>
                )
              })()}

              <ContinueButton onClick={next} disabled={!canContinue()} />
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              STEP 2 — PROFILE
          ══════════════════════════════════════ */}
          {step === 2 && (
            <motion.div
              key="profile"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-[100svh] flex flex-col overflow-y-auto"
            >
              <div className="px-6 py-12 flex flex-col justify-between h-full">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-8"
              >
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  Let&apos;s personalize{' '}
                  <span style={{ color: LIME }}>your profile</span>
                </h2>
                <p style={{ color: MUTED }}>Enter your basic details</p>
              </motion.div>

              <div className="space-y-5">
                {/* Height */}
                <motion.div
                  custom={1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: '#aaa' }}
                  >
                    Height
                  </label>
                  <div
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: CARD, border: `2px solid ${BORDER}` }}
                  >
                    {data.unit_system === 'metric' ? (
                      <>
                        <input
                          type="number"
                          value={data.height_cm}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              height_cm: Number(e.target.value),
                            }))
                          }
                          className="bg-transparent text-white text-lg font-bold w-full outline-none"
                          min={100}
                          max={250}
                        />
                        <span style={{ color: '#666' }}>cm</span>
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          value={heightFt}
                          onChange={(e) =>
                            handleHeightImperial(
                              Number(e.target.value),
                              heightIn
                            )
                          }
                          className="bg-transparent text-white text-lg font-bold w-16 outline-none"
                          min={3}
                          max={8}
                        />
                        <span style={{ color: '#666' }}>ft</span>
                        <input
                          type="number"
                          value={heightIn}
                          onChange={(e) =>
                            handleHeightImperial(
                              heightFt,
                              Number(e.target.value)
                            )
                          }
                          className="bg-transparent text-white text-lg font-bold w-16 outline-none"
                          min={0}
                          max={11}
                        />
                        <span style={{ color: '#666' }}>in</span>
                      </>
                    )}
                    <button onClick={toggleUnits} type="button">
                      <ArrowLeftRight size={18} color={LIME} />
                    </button>
                  </div>
                </motion.div>

                {/* Weight */}
                <motion.div
                  custom={2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: '#aaa' }}
                  >
                    Weight
                  </label>
                  <div
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: CARD, border: `2px solid ${BORDER}` }}
                  >
                    <input
                      type="number"
                      value={
                        data.unit_system === 'metric'
                          ? data.weight_kg
                          : Math.round(data.weight_kg * 2.205)
                      }
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        setData((prev) => ({
                          ...prev,
                          weight_kg:
                            prev.unit_system === 'metric'
                              ? val
                              : val / 2.205,
                        }))
                      }}
                      className="bg-transparent text-white text-lg font-bold w-full outline-none"
                    />
                    <div
                      className="flex items-center gap-1"
                      style={{ color: LIME }}
                    >
                      <span className="text-sm font-bold">
                        {data.unit_system === 'metric' ? 'kg' : 'lbs'}
                      </span>
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </motion.div>

                {/* Age */}
                <motion.div
                  custom={3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="grid grid-cols-[1fr_1.2fr] items-center gap-4 p-4 rounded-2xl"
                    style={{ background: CARD, border: `2px solid ${BORDER}` }}
                  >
                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: '#aaa' }}
                      >
                        Age
                      </label>
                      <div className="flex items-end gap-2">
                        <input
                          type="number"
                          value={data.age}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              age: Number(e.target.value),
                            }))
                          }
                          className="bg-transparent text-white text-lg font-bold w-20 outline-none"
                          min={10}
                          max={100}
                        />
                        <span className="text-sm" style={{ color: '#666' }}>
                          yrs
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-right text-xs uppercase tracking-[0.22em]"
                        style={{ color: '#999' }}>
                        Slide to select
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={1}
                        value={data.age}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            age: Number(e.target.value),
                          }))
                        }
                        className="w-full h-2 rounded-full"
                        style={{ accentColor: LIME }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Gender */}
                <motion.div
                  custom={4}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: '#aaa' }}
                  >
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['male', 'female', 'other'] as Gender[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() =>
                          setData((prev) => ({ ...prev, gender: g }))
                        }
                        className="py-3 rounded-2xl text-sm font-bold capitalize transition-all"
                        style={{
                          background:
                            data.gender === g
                              ? 'rgba(200,255,0,0.12)'
                              : CARD,
                          border: `2px solid ${
                            data.gender === g ? LIME : BORDER
                          }`,
                          color: data.gender === g ? '#fff' : MUTED,
                        }}
                      >
                        {g === 'male'
                          ? '♂ Male'
                          : g === 'female'
                          ? '♀ Female'
                          : '⊙ Other'}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>

              <div className="mt-8">
                <ContinueButton onClick={next} disabled={!canContinue()} />
              </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              STEP 3 — LIFESTYLE
          ══════════════════════════════════════ */}
          {step === 3 && (
            <motion.div
              key="lifestyle"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-[100svh] flex flex-col overflow-y-auto"
            >
              <div className="px-6 py-12 flex flex-col justify-between h-full">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-8"
              >
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  Tell us about your{' '}
                  <span style={{ color: LIME }}>lifestyle</span>
                </h2>
                <p style={{ color: MUTED }}>
                  This helps us create a plan that fits you.
                </p>
              </motion.div>

              <div className="space-y-3 mb-8">
                {LIFESTYLES.map((item, i) => {
                  const Icon = item.icon
                  const isSelected = data.lifestyle === item.id
                  return (
                    <motion.button
                      key={item.id}
                      custom={i + 1}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      type="button"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          lifestyle: item.id,
                        }))
                      }
                      className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
                      style={{
                        background: isSelected
                          ? 'rgba(200,255,0,0.10)'
                          : CARD,
                        border: `2px solid ${isSelected ? LIME : BORDER}`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isSelected
                            ? 'rgba(200,255,0,0.2)'
                            : '#222',
                        }}
                      >
                        <Icon
                          size={20}
                          color={isSelected ? LIME : '#666'}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div
                          className="font-bold text-sm"
                          style={{ color: isSelected ? '#fff' : '#ccc' }}
                        >
                          {item.label}
                        </div>
                        <div className="text-xs" style={{ color: '#666' }}>
                          {item.sub}
                        </div>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isSelected ? LIME : 'transparent',
                          border: `2px solid ${isSelected ? LIME : DIM}`,
                        }}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              <ContinueButton onClick={next} disabled={!canContinue()} />
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              STEP 4 — BODY TYPE
              Uses: Ectomorph.png, Mesomorph.png, Endomorph.png
              Real photos replace the old SVG shapes
          ══════════════════════════════════════ */}
          {step === 4 && (
            <motion.div
              key="bodytype"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-[100svh] flex flex-col overflow-y-auto"
            >
              <div className="px-6 py-12 flex flex-col justify-between h-full">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-8"
              >
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  Select your <span style={{ color: LIME }}>body type</span>
                </h2>
                <p style={{ color: MUTED }}>
                  We&apos;ll tailor workouts and nutrition for you.
                </p>
              </motion.div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {BODY_TYPES.map((bt, i) => {
                  const isSelected = data.body_type === bt.id
                  return (
                    <motion.button
                      key={bt.id}
                      custom={i + 1}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      type="button"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          body_type: bt.id,
                        }))
                      }
                      className="flex flex-col items-center rounded-2xl overflow-hidden transition-all"
                      style={{
                        background: isSelected
                          ? 'rgba(200,255,0,0.10)'
                          : CARD,
                        border: `2px solid ${isSelected ? LIME : BORDER}`,
                      }}
                    >
                      {/* ── Real photo ──────────────────────── */}
                      <div className="w-full relative" style={{ height: 140 }}>
                        <Image
                          src={bt.image}
                          alt={bt.label}
                          fill
                          className="object-cover object-top"
                        />
                        {/* Dark overlay — lighter when selected */}
                        <div
                          className="absolute inset-0 transition-all"
                          style={{
                            background: isSelected
                              ? 'rgba(10,10,10,0.15)'
                              : 'rgba(10,10,10,0.55)',
                          }}
                        />
                        {/* Lime tint glow on selected */}
                        {isSelected && (
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                'linear-gradient(to bottom, rgba(200,255,0,0.08) 0%, rgba(200,255,0,0.0) 100%)',
                            }}
                          />
                        )}
                      </div>

                      {/* Label below photo */}
                      <div className="p-2 w-full text-center">
                        <div
                          className="text-xs font-bold mb-0.5"
                          style={{ color: isSelected ? LIME : '#ccc' }}
                        >
                          {bt.label}
                        </div>
                        {bt.sub.split('·').map((s, idx) => (
                          <div key={idx} className="text-xs leading-tight" style={{ color: '#666' }}>
                            {s.trim()}
                          </div>
                        ))}
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              <ContinueButton
                onClick={handleComplete}
                disabled={!canContinue()}
                label="Continue"
              />
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              STEP 5 — ALL SET
          ══════════════════════════════════════ */}
          {step === 5 && (
            <motion.div
              key="allset"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-[100svh] flex flex-col items-center justify-center px-6 py-12 overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h2
                  className="text-4xl font-extrabold mb-2"
                  style={{ color: LIME }}
                >
                  All set!
                </h2>
                <p className="text-base" style={{ color: MUTED }}>
                  Your personalized workspace
                  <br />
                  is being created.
                </p>
              </motion.div>

              {/* Calorie goal card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-full mb-10 flex items-center justify-center"
              >
                <div
                  className="w-56 h-40 rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: 'rgba(0, 200, 180, 0.08)',
                    border: '1px solid rgba(0,200,180,0.3)',
                  }}
                >
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-16 rounded-full opacity-30"
                    style={{
                      background:
                        'radial-gradient(ellipse, #00C8B4 0%, transparent 70%)',
                    }}
                  />
                  <div className="relative z-10 text-center">
                    <div
                      className="text-4xl font-extrabold"
                      style={{ color: LIME }}
                    >
                      {savedGoals?.daily_calorie_goal ?? '—'}
                    </div>
                    <div className="text-xs" style={{ color: '#00C8B4' }}>
                      kcal daily goal
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Completion checklist */}
              <div className="w-full space-y-4">
                {COMPLETION_STEPS.map((s, i) => {
                  const isDone = completedSteps.includes(i)
                  const isActive =
                    !isDone && completedSteps.length === i
                  return (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                        {isDone ? (
                          <CheckCircle2 size={22} color={LIME} />
                        ) : isActive ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1,
                              ease: 'linear',
                            }}
                            className="w-5 h-5 rounded-full border-2"
                            style={{
                              borderColor: LIME,
                              borderTopColor: 'transparent',
                            }}
                          />
                        ) : (
                          <div
                            className="w-5 h-5 rounded-full border-2"
                            style={{ borderColor: '#333' }}
                          />
                        )}
                      </div>
                      <span
                        className="text-sm font-medium transition-colors"
                        style={{
                          color: isDone ? '#fff' : isActive ? LIME : DIM,
                        }}
                      >
                        {s}
                      </span>
                    </motion.div>
                  )
                })}
              </div>

              {/* Let's Go button */}
              <AnimatePresence>
                {completedSteps.length === COMPLETION_STEPS.length && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => router.push('/dashboard')}
                    type="button"
                    className="w-full mt-10 py-4 rounded-2xl flex items-center justify-center gap-3 text-base font-bold"
                    style={{ background: LIME, color: BG }}
                  >
                    Let&apos;s Go! <Rocket size={20} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

// ============================================================
//  SUB-COMPONENTS
// ============================================================

function ContinueButton({
  onClick,
  disabled = false,
  label = 'Continue',
}: {
  onClick: () => void
  disabled?: boolean
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-base font-bold transition-all active:scale-95"
      style={{
        background: disabled ? '#1a1a1a' : '#C8FF00',
        color: disabled ? '#444' : '#0A0A0A',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label} <ArrowRight size={20} />
    </button>
  )
}

// ============================================================
//  END OF FILE
// ============================================================