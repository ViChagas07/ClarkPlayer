import { create } from 'zustand'

export const SIDEBAR_WIDTH = 240 // px — matches Tailwind w-sidebar (15rem)

interface SidebarState {
  isOpen: boolean
  width: number
  toggle: () => void
  setOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  width: SIDEBAR_WIDTH,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open: boolean) => set({ isOpen: open }),
}))
