# ClarkPlayer Agent Memory

## CRITICAL RULE — ALWAYS PUSH AFTER COMPLETING WORK

After EVERY completed prompt/task, you MUST:

```bash
git add -A
git commit -m "<clear descriptive message in English>"
git push origin main
```

Never leave changes uncommitted. Vercel auto-deploys on push — the user expects live updates.

## PROJECT STRUCTURE

- **Front-end**: `Front-end/UISaaS/` — Next.js 16 + React 19 + TypeScript + Tailwind
- **Backend**: `Backend/` — Python FastAPI + PostgreSQL + Redis
- **API**: `https://clarkplayer.onrender.com`
- **Frontend URL**: `https://clark-player.vercel.app`

## KEY FILES

- Player bar layout: `Front-end/UISaaS/components/layout/AppShell.tsx`
- Music cards: `Front-end/UISaaS/components/NowPlayingContent.tsx`
- Artist page: `Front-end/UISaaS/app/artists/[id]/page.tsx`
- Artist error: `Front-end/UISaaS/app/artists/[id]/error.tsx`
- Genre images: `Front-end/UISaaS/lib/genre-image-map.ts`
- API client: `Front-end/UISaaS/lib/api.ts`
- Hooks: `Front-end/UISaaS/hooks/useCatalog.ts`
- Types: `Front-end/UISaaS/types/index.ts`

## KNOWN PATTERNS

- Backend returns FLAT artist responses → `api.ts` `catalogArtist()` transforms to nested `{ artist, albums, top_tracks, similar }`
- `CatalogTrackItem` uses `album_cover` and `album_title` (not `cover_url`/`album_name`)
- Sleep-timer endpoints require `Authorization: Bearer <token>` — always check auth before calling
- Player bar uses 3-region architecture: Left (track info) | Center (absolute `left:50%; transform:translateX(-50%)`) | Right (queue+volume)
- 5 controls in center row (odd count) so Play is exact center
