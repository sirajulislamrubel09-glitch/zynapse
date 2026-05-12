// ============================================================
//  ZYNAPSE — UNIFIED AI PROVIDER
//  lib/ai/provider.ts
//
//  Architecture:
//  1. Primary:  OpenRouter (claude-3-haiku — fast & cheap)
//  2. Fallback: Groq key rotation (llama3-8b — free tier)
//  3. Static:   Hardcoded motivational fallbacks
//
//  Features:
//  - Provider abstraction (swap models easily)
//  - Key rotation for Groq
//  - Exponential backoff retries
//  - Streaming support via ReadableStream
//  - Typed message format
// ============================================================

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type ProviderResult = {
  text: string
  provider: 'openrouter' | 'groq' | 'fallback'
}

// ─── Static fallbacks ─────────────────────────────────────────
const FALLBACKS = [
  'Consistency is the multiplier. Show up today.',
  'Every rep, every meal, every choice compounds.',
  'Discipline today. Freedom tomorrow.',
  'Champions train when they do not feel like it.',
  'Progress is built one decision at a time.',
]

function randomFallback() {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
}

// ─── Groq key rotation ────────────────────────────────────────
function getGroqKeys(): string[] {
  return [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_5,
  ].filter(Boolean) as string[]
}

// Module-level key index (rotates across requests in same process)
let groqKeyIdx = 0

function nextGroqKey(keys: string[]): string {
  const key = keys[groqKeyIdx % keys.length]
  groqKeyIdx++
  return key
}

// ─── Sleep utility ────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ─── OpenRouter ───────────────────────────────────────────────
async function callOpenRouter(
  messages: ChatMessage[],
  maxTokens: number
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('No OpenRouter key')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zynapse.app',
      'X-Title': 'Zynapse AI Coach',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-haiku-4-5',
      messages,
      max_tokens: maxTokens,
      temperature: 0.75,
    }),
    signal: AbortSignal.timeout(12000),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 100)}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('Empty OpenRouter response')
  return text
}

// ─── Groq with key rotation ───────────────────────────────────
async function callGroq(
  messages: ChatMessage[],
  maxTokens: number,
  attempt = 0
): Promise<string> {
  const keys = getGroqKeys()
  if (!keys.length) throw new Error('No Groq keys')
  if (attempt >= keys.length) throw new Error('All Groq keys exhausted')

  const key = nextGroqKey(keys)

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages,
      max_tokens: maxTokens,
      temperature: 0.75,
    }),
    signal: AbortSignal.timeout(10000),
  })

  if (res.status === 429 || res.status === 401) {
    // Rate limit or bad key — try next
    await sleep(200 * (attempt + 1))
    return callGroq(messages, maxTokens, attempt + 1)
  }

  if (!res.ok) {
    throw new Error(`Groq ${res.status}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('Empty Groq response')
  return text
}

// ─── Main unified call ────────────────────────────────────────
export async function aiChat(
  messages: ChatMessage[],
  options: { maxTokens?: number } = {}
): Promise<ProviderResult> {
  const maxTokens = options.maxTokens ?? 300

  // Try OpenRouter first
  try {
    const text = await callOpenRouter(messages, maxTokens)
    return { text, provider: 'openrouter' }
  } catch (err) {
    console.warn('[AI] OpenRouter failed, trying Groq:', err instanceof Error ? err.message : err)
  }

  // Fallback: Groq
  try {
    const text = await callGroq(messages, maxTokens)
    return { text, provider: 'groq' }
  } catch (err) {
    console.warn('[AI] Groq failed, using static fallback:', err instanceof Error ? err.message : err)
  }

  // Last resort: static
  return { text: randomFallback(), provider: 'fallback' }
}

// ─── Streaming version (OpenRouter only) ──────────────────────
export async function aiStream(
  messages: ChatMessage[],
  options: { maxTokens?: number } = {}
): Promise<ReadableStream<string> | null> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return null

  const maxTokens = options.maxTokens ?? 400

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zynapse.app',
        'X-Title': 'Zynapse AI Coach',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4-5',
        messages,
        max_tokens: maxTokens,
        temperature: 0.75,
        stream: true,
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok || !res.body) return null

    // Transform SSE stream → string chunks
    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    return new ReadableStream<string>({
      async pull(controller) {
        const { done, value } = await reader.read()
        if (done) { controller.close(); return }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') { controller.close(); return }
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) controller.enqueue(delta)
          } catch { /* skip malformed chunks */ }
        }
      },
      cancel() { reader.cancel() },
    })
  } catch {
    return null
  }
}

// ─── Quick insight (short, fast) ──────────────────────────────
export async function aiInsight(
  messages: ChatMessage[]
): Promise<string> {
  const result = await aiChat(messages, { maxTokens: 80 })
  return result.text
}
