'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Toast as ToastType } from '@/types'

interface ToastContextType {
  success: (message: string, action?: { label: string; onClick: () => void }) => void
  error: (message: string, action?: { label: string; onClick: () => void }) => void
  info: (message: string, action?: { label: string; onClick: () => void }) => void
  warning: (message: string, action?: { label: string; onClick: () => void }) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const colorMap = {
  success: 'text-emerald-400',
  error: 'text-clark-danger',
  info: 'text-clark-sky',
  warning: 'text-clark-gold',
}

const borderColorMap = {
  success: 'border-emerald-500/30',
  error: 'border-clark-danger/30',
  info: 'border-clark-sky/30',
  warning: 'border-clark-gold/30',
}

const bgMap = {
  success: 'bg-emerald-950/40',
  error: 'bg-clark-danger/10',
  info: 'bg-clark-bg-card',
  warning: 'bg-clark-gold/10',
}

const roleMap = {
  success: 'status',
  error: 'alert',
  info: 'status',
  warning: 'alert',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const addToast = useCallback((type: ToastType['type'], message: string, action?: { label: string; onClick: () => void }) => {
    const id = crypto.randomUUID()
    setToasts((prev) => {
      const next = [...prev, { id, type, message, action }]
      return next.slice(-3)
    })
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const contextValue: ToastContextType = {
    success: (msg, action) => addToast('success', msg, action),
    error: (msg, action) => addToast('error', msg, action),
    info: (msg, action) => addToast('info', msg, action),
    warning: (msg, action) => addToast('warning', msg, action),
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-28 right-4 z-toast flex flex-col gap-2 max-w-sm" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type]
          return (
            <div
              key={toast.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl shadow-card border animate-slide-in font-body text-sm',
                bgMap[toast.type],
                borderColorMap[toast.type],
              )}
              role={roleMap[toast.type]}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', colorMap[toast.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-clark-text-primary">{toast.message}</p>
                {toast.action && (
                  <button
                    onClick={toast.action.onClick}
                    className="mt-1 font-body font-semibold text-xs text-clark-gold hover:text-clark-gold-hover transition-colors"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-clark-text-muted hover:text-clark-text-primary transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}