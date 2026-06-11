/**
 * Auth Modal Wrapper
 * 
 * Manages the display of the authentication modal.
 * The modal only opens when the user explicitly clicks the "Login account" button
 * (via the auth store's `showAuthModal` flag). It can be closed at any time.
 */

'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { AuthModal } from './AuthModal'

// Pages where we don't want to show the modal (they have their own auth forms)
const AUTH_PAGES = ['/login', '/forgot-password', '/auth/callback']

export function AuthModalWrapper() {
  const [defaultTab, setDefaultTab] = useState<'login' | 'register'>('login')
  const { isAuthenticated, showAuthModal, setShowAuthModal } = useAuthStore()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Check for auth-related query params (e.g., from OAuth callback)
  useEffect(() => {
    const error = searchParams.get('error')
    const registered = searchParams.get('registered')
    
    if (error) {
      setDefaultTab('login')
    } else if (registered === '1') {
      setDefaultTab('login')
    }
  }, [searchParams])

  // Close modal automatically when the user authenticates
  useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      setShowAuthModal(false)
    }
  }, [isAuthenticated, showAuthModal, setShowAuthModal])

  // Close modal when navigating to an auth page
  useEffect(() => {
    if (AUTH_PAGES.some(page => pathname.startsWith(page)) && showAuthModal) {
      setShowAuthModal(false)
    }
  }, [pathname, showAuthModal, setShowAuthModal])

  // Allow closing at any time — authenticated or not
  const handleClose = () => {
    setShowAuthModal(false)
  }

  // Don't render anything on auth pages
  if (AUTH_PAGES.some(page => pathname.startsWith(page))) {
    return null
  }

  return (
    <AuthModal 
      isOpen={showAuthModal} 
      onClose={handleClose} 
      defaultTab={defaultTab}
    />
  )
}
