import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Zynapse — AI Fitness & Nutrition Coach'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#080808',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(170,255,0,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: '#AAFF00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
            fontSize: 36,
            color: '#000',
            fontWeight: 900,
          }}
        >
          ⚡
        </div>

        {/* Brand */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '0.15em',
            marginBottom: 16,
          }}
        >
          ZYNAPSE
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            color: '#AAFF00',
            fontWeight: 700,
            marginBottom: 32,
            letterSpacing: '0.05em',
          }}
        >
          AI FITNESS &amp; NUTRITION COACH
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['🏋️ Workout Tracker', '📸 Meal Scanner', '🧠 Detox Hub', '⚡ Discipline Score'].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: 'rgba(170,255,0,0.08)',
                  border: '1px solid rgba(170,255,0,0.25)',
                  borderRadius: 100,
                  padding: '10px 20px',
                  color: '#cccccc',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        {/* Bottom stat bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            gap: 48,
            color: '#555',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <span style={{ color: '#AAFF00' }}>10K+ Users</span>
          <span>·</span>
          <span style={{ color: '#AAFF00' }}>4.9★ Rating</span>
          <span>·</span>
          <span style={{ color: '#AAFF00' }}>Free to Start</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
