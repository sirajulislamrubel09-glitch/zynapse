// ============================================================
//  ZYNAPSE — AI INSIGHT API
//  app/api/ai/insight/route.ts
// ============================================================

import { NextResponse } from 'next/server'
import { aiInsight } from '@/lib/ai/provider'

export async function POST(request: Request) {
  try {
    const {
      name, goal, caloriesConsumed, calorieGoal,
      workoutsToday, detoxStreak, focusMins, disciplineScore,
    } = await request.json()

    const remaining = Math.max((calorieGoal ?? 2000) - (caloriesConsumed ?? 0), 0)

    const insight = await aiInsight([
      {
        role: 'system',
        content: `You are Zynapse AI — a sharp, motivating fitness coach.
Write ONE punchy sentence (max 20 words) of personalized insight based on the user's data.
Be specific. Be real. No generic advice. No emojis. Sound like a coach who knows their data.`,
      },
      {
        role: 'user',
        content: `User: ${name}. Goal: ${goal?.replace(/_/g, ' ')}.
Calories: ${caloriesConsumed}/${calorieGoal} (${remaining} remaining).
Workouts today: ${workoutsToday}. Streak: ${detoxStreak} days.
Focus: ${focusMins} mins. Discipline score: ${disciplineScore}/100.
Give one insight.`,
      },
    ])

    return NextResponse.json({ insight: insight || null })
  } catch {
    return NextResponse.json({ insight: null })
  }
}
