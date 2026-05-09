import Image from "next/image"
import Link from "next/link"
import { Brain, Dumbbell, Droplet, Flame, CheckCircle2 } from "lucide-react"

const STATS = [
  { value: "1,247", label: "Calories Burned", icon: Flame, color: "#C8FF00" },
  { value: "28", label: "Workouts", icon: Dumbbell, color: "#00D4FF" },
  { value: "2.4L", label: "Water", icon: Droplet, color: "#00D4FF" },
  { value: "87", label: "Discipline Score", icon: Brain, color: "#C8FF00" },
]

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
      {/* Hero background with glow */}
      <div className="absolute inset-0">
        <div className="absolute inset-x-0 top-0 z-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(200,255,0,0.15),transparent_50%)] opacity-70" />
        <div className="absolute -right-32 top-32 z-0 h-96 w-96 rounded-full bg-gradient-to-br from-[#C8FF00]/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-5 py-6 sm:px-8">
        {/* Logo Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="relative mb-2 h-16 w-16">
            <div className="absolute inset-0 rounded-3xl bg-[#C8FF00]/20 blur-xl" />
            <div className="relative flex h-full w-full items-center justify-center rounded-3xl bg-[#C8FF00]/10 ring-1 ring-[#C8FF00]/30">
              <span className="text-3xl font-black text-[#C8FF00]">Z</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-[0.15em] text-white">ZYNAPSE</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C8FF00]">AI for a better you</p>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="mb-8 flex justify-center">
          <div className="relative h-80 w-full max-w-sm overflow-hidden rounded-2xl">
            <Image
              src="/images/body-builder-2.png"
              alt="Fitness motivation"
              fill
              className="object-cover object-right"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
          </div>
        </div>

        {/* Main Headline */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl font-black leading-tight tracking-tight text-white">
            Train. <span className="text-[#C8FF00]">Fuel.</span> Focus.
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            AI-Powered Fitness, Nutrition &<br />Discipline for Your Best Self.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
              >
                <div className="mb-3 flex justify-center">
                  <div className="rounded-lg p-2" style={{ backgroundColor: `${stat.color}20` }}>
                    <Icon size={24} style={{ color: stat.color }} strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
                <svg className="mx-auto mt-2 h-8 w-full" viewBox="0 0 60 20" preserveAspectRatio="none">
                  <polyline
                    points="0,15 10,12 20,16 30,10 40,14 50,8 60,12"
                    fill="none"
                    stroke={stat.color}
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                </svg>
              </div>
            )
          })}
        </div>

        {/* AI Coach Section */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#00D4FF]/20 bg-gradient-to-br from-[#00D4FF]/5 to-transparent p-6 backdrop-blur-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="rounded-lg bg-[#C8FF00]/20 p-2">
              <CheckCircle2 size={20} className="text-[#C8FF00]" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.1em] text-[#C8FF00]">AI Coach</p>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            "Discipline is doing what needs to be done, even when you don't feel like it."
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mb-6 space-y-3">
          <Link
            href="/signup"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C8FF00] py-4 text-sm font-bold uppercase tracking-[0.1em] text-black transition hover:bg-lime-300"
          >
            Start Your Journey
            <span className="text-lg">→</span>
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-full border-2 border-white/20 bg-transparent py-4 text-sm font-bold uppercase tracking-[0.1em] text-slate-100 transition hover:border-[#C8FF00]/40"
          >
            I Already Have an Account
          </Link>
        </div>

        {/* Footer Security Note */}
        <div className="flex items-center justify-center gap-2 border-t border-white/10 pt-6 text-xs text-slate-400">
          <CheckCircle2 size={16} className="text-[#C8FF00]" />
          <span>Your data is secure and encrypted</span>
          <span className="text-[#C8FF00]">Learn more →</span>
        </div>
      </div>
    </div>
  )
}
