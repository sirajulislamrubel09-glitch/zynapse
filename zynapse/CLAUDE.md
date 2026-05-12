# Zynapse — AI Fitness Platform

## Architecture

### AI System (lib/ai/provider.ts)
- **Primary**: OpenRouter → `anthropic/claude-haiku-4-5` (fast, cheap)
- **Fallback**: Groq → `llama3-8b-8192` with key rotation (up to 5 keys)
- **Last resort**: Static motivational phrases
- Supports streaming via SSE for coach chat
- Conversation history passed for memory (last 6 messages)

### Routes
- `POST /api/ai/chat` — Coach chat with streaming support (`?stream=true`)
- `POST /api/ai/insight` — Dashboard/coach insight (single sentence)

### Pages
- `/dashboard` — Home with calorie ring, stats, AI insight, workout plan, focus timer
- `/workout` — Workout plan with weekly tracker, split, recommended
- `/coach` — AI Coach chat with recommendations and today's plan
- `/profile` — Stats, achievements, settings
- `/food` — Meal logging (existing)

## Environment Variables
See `.env.example` for required variables.

## AI Chat Memory
Chat history is passed client-side (last 6 messages) in each request for context continuity.
For persistent memory, add a `chat_history` Supabase table.

## Deployment (Vercel)
1. `npm install && npm run build` — should pass clean
2. Set environment variables in Vercel dashboard
3. Supabase: ensure `profiles`, `meals`, `workout_logs`, `detox_logs`, `focus_sessions` tables exist
4. Optional: add `ai_chat_logs` table for daily limit tracking (columns: `id`, `user_id`, `created_at`, `message_preview`)
