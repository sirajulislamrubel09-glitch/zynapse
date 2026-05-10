// ============================================================
//  ZYNAPSE — AI INSIGHT API ROUTE
//  File: app/api/ai/insight/route.ts
//  The dashboard calls this to get a personalized AI message
// ============================================================

import { NextResponse } from 'next/server'

const GROQ_KEYS = [
  process.env.GROQ_API_KEY_1, process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3, process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
].filter(Boolean) as string[]

let keyIndex = 0

async function callGroq(messages: object[], retries = 0): Promise<string> {
  if (GROQ_KEYS.length === 0 || retries >= GROQ_KEYS.length) {
    return 'Stay consistent. Every rep, every meal, every choice compounds into the person you\'re becoming.'
  }
  const key = GROQ_KEYS[keyIndex % GROQ_KEYS.length]
  keyIndex++
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages,
        max_tokens: 80,
        temperature: 0.8,
      }),
    })
    if (res.status === 429 || res.status === 401) return callGroq(messages, retries + 1)
    if (!res.ok) return callGroq(messages, retries + 1)
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? ''
  } catch {
    return callGroq(messages, retries + 1)
  }
}

export async function POST(request: Request) {
  try {
    const { name, goal, caloriesConsumed, calorieGoal, workoutsToday, detoxStreak, focusMins, disciplineScore } = await request.json()

    const remaining = Math.max((calorieGoal ?? 2000) - (caloriesConsumed ?? 0), 0)

    const insight = await callGroq([
      {
        role: 'system',
        content: `You are Zynapse AI — a sharp, motivating fitness coach. Write ONE punchy sentence (max 20 words) of personalized insight based on the user's data. Be specific. Be real. No generic advice. No emojis. Sound like a coach who knows their data.`,
      },
      {
        role: 'user',
        content: `User: ${name}. Goal: ${goal?.replace(/_/g, ' ')}. Calories consumed: ${caloriesConsumed}/${calorieGoal} (${remaining} remaining). Workouts today: ${workoutsToday}. Detox streak: ${detoxStreak} days. Focus time: ${focusMins} mins. Discipline score: ${disciplineScore}/100. Give one insight.`,
      },
    ])

    return NextResponse.json({ insight: insight || null })
  } catch {
    return NextResponse.json({ insight: null })
  }
}