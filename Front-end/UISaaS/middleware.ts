/**
 * Next.js Edge Middleware.
 *
 * Because auth state lives in `localStorage` (client-side only), this middleware
 * cannot inspect the Zustand store. Instead, it relies on a lightweight `auth_token`
 * cookie that we set alongside the Zustand persist data.
 *
 * Rules:
 * - If the user has an auth cookie and visits `/login`, `/register`, or
 *   `/forgot-password`, redirect them to `/` (they're already logged in).
 * - Allow access to all other pages - the AuthModal will handle unauthenticated states.
 * - The callback page must be accessible to handle OAuth redirects.
 */

import  { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_AUTH_PAGES = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasAuthToken = request.cookies.has('auth_token')

  // If authenticated and trying to visit an auth page, redirect home
  if (hasAuthToken && PUBLIC_AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Run middleware on auth pages and root to handle redirects
  matcher: ['/', '/login', '/register', '/forgot-password'],
}
