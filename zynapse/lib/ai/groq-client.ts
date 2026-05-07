// This system automatically rotates through your Groq keys
// When one key hits its limit, it tries the next one.
// Users will NEVER see an "AI unavailable" error.

const GROQ_KEYS = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
].filter(Boolean) as string[]

let currentKeyIndex = 0

function getNextKey(): string {
  const key = GROQ_KEYS[currentKeyIndex % GROQ_KEYS.length]
  currentKeyIndex++
  return key
}

export async function groqChat(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  retries = 0
): Promise<string> {
  if (GROQ_KEYS.length === 0) {
    return 'AI features coming soon.'
  }

  const maxRetries = GROQ_KEYS.length
  if (retries >= maxRetries) {
    return 'Smart features are temporarily resting. Try again in a moment.'
  }

  const apiKey = getNextKey()

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',  // Free & fast Groq model
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (response.status === 429 || response.status === 401) {
      // Key exhausted or invalid, try next key
      return groqChat(messages, retries + 1)
    }

    if (!response.ok) {
      return groqChat(messages, retries + 1)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content ?? 'No response generated.'
  } catch {
    return groqChat(messages, retries + 1)
  }
}