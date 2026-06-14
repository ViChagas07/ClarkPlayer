import { AppShell } from '@/components/layout/AppShell'

export default function ArtistDetailLoading() {
  return (
    <AppShell>
      <div className="space-y-8 animate-pulse">
        <div className="relative -mx-6 -mt-8 h-64 bg-gradient-to-b from-clark-bg-secondary/30 to-clark-bg-primary" />
        <div className="h-8 bg-clark-bg-secondary/50 rounded w-48" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-clark-bg-secondary/30 rounded-xl" />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
