// ============================================================
//  ZYNAPSE — AI CHAT API ROUTE
//  File: app/api/ai/chat/route.ts
// ============================================================

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const GROQ_KEYS = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
].filter(Boolean) as string[]

let keyIdx = 0

async function groq(messages: object[], retries = 0): Promise<string> {
  if (!GROQ_KEYS.length || retries >= GROQ_KEYS.length) {
    return "I'm recharging. Try again in a moment."
  }

  const key = GROQ_KEYS[keyIdx % GROQ_KEYS.length]
  keyIdx++

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages,
        max_tokens: 200,
        temperature: 0.75,
      }),
    })

    if (res.status === 429 || res.status === 401) {
      return groq(messages, retries + 1)
    }

    if (!res.ok) {
      return groq(messages, retries + 1)
    }

    const data = await res.json()

    return (
      data.choices?.[0]?.message?.content?.trim() ??
      "Let's get after it."
    )
  } catch {
    return groq(messages, retries + 1)
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, context } = await request.json()

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, full_name, fitness_goal, daily_calorie_goal')
      .eq('id', user.id)
      .single()

    if (!profile?.is_premium) {
      const today = new Date().toISOString().split('T')[0]

      const { count } = await supabase
        .from('focus_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('session_type', 'focus')
        .gte('created_at', `${today}T00:00:00`)

      if ((count ?? 0) >= 5) {
        return NextResponse.json({ limitReached: true })
      }
    }

    const systemPrompt = `You are Zynapse AI — a sharp, direct, world-class personal fitness coach.
User: ${profile?.full_name ?? 'Champion'}
Goal: ${profile?.fitness_goal?.replace(/_/g, ' ') ?? 'fitness'}
Daily calorie target: ${profile?.daily_calorie_goal ?? 2000} kcal
Context: ${JSON.stringify(context ?? {})}

Rules:
- Max 3 sentences. Be specific and direct.
- No generic advice. Use their actual data.
- Sound like a coach who knows them personally.
- If they ask something off-topic, redirect to fitness/health.
- Never say "I" too much. Focus on them.`

    const reply = await groq([
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: message,
      },
    ])

    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({
      reply: 'Connection hiccup. Try again.',
    })
  }
}