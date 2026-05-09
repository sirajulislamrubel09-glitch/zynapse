// ============================================================
//  ZYNAPSE — MIDDLEWARE
//  File: middleware.ts  (place in ROOT of zynapse folder,
//        same level as package.json — NOT inside /app)
//
//  This is the TRAFFIC CONTROLLER of your app.
//  Every page request passes through here first.
//
//  Rules:
//  1. Not logged in → can only see / /login /signup
//  2. Logged in + onboarding NOT done → forced to /onboarding
//  3. Logged in + onboarding DONE → can access everything
//  4. Already logged in + visits /login or /signup → redirect away
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Build a response we can attach cookies to
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Create Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get current user (never throws)
  const { data: { user } } = await supabase.auth.getUser()

  // ── Route categories ─────────────────────────────────────
  const isPublic     = pathname === '/' || pathname === '/privacy' || pathname === '/terms'
  const isAuthPage   = pathname === '/login' || pathname === '/signup'
  const isOnboarding = pathname === '/onboarding'
  const isCallback   = pathname.startsWith('/auth')
  const isApp        = ['/dashboard', '/workout', '/food', '/coach', '/profile'].some(
                         r => pathname.startsWith(r)
                       )

  // ── Rule 1: Let public pages and auth callbacks pass freely ─
  if (isPublic || isCallback) {
    return response
  }

  // ── Rule 2: Not logged in ────────────────────────────────
  if (!user) {
    // Trying to access app pages → send to login
    if (isApp || isOnboarding) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    // Auth pages are fine
    return response
  }

  // ── User IS logged in — check onboarding status ──────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  const onboardingDone = profile?.onboarding_completed === true

  // ── Rule 3: Logged in, visiting /login or /signup ────────
  if (isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = onboardingDone ? '/dashboard' : '/onboarding'
    return NextResponse.redirect(url)
  }

  // ── Rule 4: Logged in, onboarding NOT done ───────────────
  if (!onboardingDone && isApp) {
    // Trying to skip onboarding and go to app → force back
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding'
    return NextResponse.redirect(url)
  }

  // ── Rule 5: Logged in, onboarding DONE, visits /onboarding
  if (onboardingDone && isOnboarding) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

// Tell Next.js which routes to run middleware on
// Excludes static files, images, and API routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|icons|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}