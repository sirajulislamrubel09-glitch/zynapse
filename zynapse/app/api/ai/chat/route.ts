// ============================================================
//  ZYNAPSE — AI CHAT API (STREAMING + FALLBACK)
//  app/api/ai/chat/route.ts
// ============================================================

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { aiChat, aiStream, type ChatMessage } from '@/lib/ai/provider'

function buildSystemPrompt(profile: {
  full_name?: string
  fitness_goal?: string
  daily_calorie_goal?: number
} | null, context: Record<string, unknown>) {
  const name = profile?.full_name?.split(' ')[0] ?? 'Champion'
  const goal = profile?.fitness_goal?.replace(/_/g, ' ') ?? 'fitness'
  const kcalGoal = profile?.daily_calorie_goal ?? 2000

  return `You are Zynapse AI — a sharp, direct, world-class personal fitness coach.

User: ${name}
Goal: ${goal}
Daily calorie target: ${kcalGoal} kcal
Live data: ${JSON.stringify(context)}

Rules:
- Max 3 sentences. Be direct and specific.
- No generic advice. Reference their actual numbers.
- Sound like a coach who knows them personally.
- If off-topic, redirect to fitness/health/mindset.
- No filler phrases. Every word earns its place.`
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, context, history, stream: wantStream } = await request.json()

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, full_name, fitness_goal, daily_calorie_goal')
      .eq('id', user.id)
      .single()

    // Free user daily limit check
    if (!profile?.is_premium) {
      const today = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('ai_chat_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)

      if ((count ?? 0) >= 5) {
        return NextResponse.json({ limitReached: true })
      }

      await supabase.from('ai_chat_logs').insert({
        user_id: user.id,
        message_preview: message.slice(0, 50),
      }).catch(() => {})
    }

    const systemPrompt = buildSystemPrompt(profile, context ?? {})

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...((history ?? []) as { role: 'user' | 'assistant'; content: string }[])
        .slice(-6)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message },
    ]

    if (wantStream) {
      const stream = await aiStream(messages, { maxTokens: 400 })
      if (stream) {
        const encoder = new TextEncoder()
        const readable = new ReadableStream({
          async start(controller) {
            const reader = stream.getReader()
            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: value })}\n\n`))
              }
            } finally {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
            }
          },
        })
        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      }
    }

    const result = await aiChat(messages, { maxTokens: 350 })
    return NextResponse.json({ reply: result.text, provider: result.provider })
  } catch {
    return NextResponse.json({ reply: 'Connection issue — try again in a moment.' })
  }
}
