import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/// Zustand store for managing user settings and preferences, including theme, accent color, font size, language, date/time formats, playback
//  settings, equalizer presets, and sleep timer.

export interface SettingsState {
  theme: 'dark' | 'light' | 'midnight'
  accentColor: string
  fontSize: 'small' | 'default' | 'large'
  boldMode: boolean
  language: string
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'
  showHiddenFiles: boolean
  crossfadeDuration: number
  gaplessPlayback: boolean
  normalization: boolean
  eqPreset: string
  eqBands: number[]
  sleepTimer: number | null
  setTheme: (t: SettingsState['theme']) => void
  setAccentColor: (hex: string) => void
  setBoldMode: (v: boolean) => void
  setFontSize: (s: SettingsState['fontSize']) => void
  setLanguage: (lang: string) => void
  setDateFormat: (f: SettingsState['dateFormat']) => void
  setTimeFormat: (f: SettingsState['timeFormat']) => void
  setShowHiddenFiles: (v: boolean) => void
  setCrossfadeDuration: (d: number) => void
  setGaplessPlayback: (v: boolean) => void
  setNormalization: (v: boolean) => void
  setEqPreset: (preset: string) => void
  setEqBand: (index: number, value: number) => void
  setSleepTimer: (ms: number | null) => void
}

const EQ_BANDS_COUNT = 10
const DEFAULT_EQ_BANDS = Array(EQ_BANDS_COUNT).fill(0)

const EQ_PRESETS: Record<string, number[]> = {
  Normal: DEFAULT_EQ_BANDS,
  Classical: [4, 3, 2, 0, -1, -1, 0, 1, 3, 4],
  Dance: [5, 4, 2, 0, 0, -1, -2, -2, -1, 0],
  Folk: [3, 3, 1, 0, -1, -1, 0, 1, 2, 3],
  'Heavy Metal': [4, 3, 1, -1, -2, -1, 0, 2, 3, 4],
  'Hip-Hop': [4, 3, 0, -1, -1, 0, 1, 2, 3, 3],
  Jazz: [3, 2, 1, 1, -1, -1, 0, 1, 2, 3],
  Pop: [1, 2, 3, 3, 1, -1, -1, 0, 1, 2],
  Rock: [4, 3, 1, 0, -1, -1, 0, 2, 3, 4],
  Custom: DEFAULT_EQ_BANDS,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      accentColor: '#E02020',
      fontSize: 'default',
      boldMode: false,
      language: 'en-US',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      showHiddenFiles: false,
      crossfadeDuration: 0,
      gaplessPlayback: true,
      normalization: false,
      eqPreset: 'Normal',
      eqBands: DEFAULT_EQ_BANDS,
      sleepTimer: null,

      setTheme: (theme) => {
        set({ theme })
        document.documentElement.dataset.theme = theme
        localStorage.setItem('clark_theme', theme)
      },

      setAccentColor: (hex) => {
        const hoverMap: Record<string, string> = {
          '#E02020': '#FF3333',
          '#CC1A1A': '#E02020',
          '#6366f1': '#4f46e5',
          '#8b5cf6': '#7c3aed',
          '#f43f5e': '#e11d48',
          '#f59e0b': '#d97706',
          '#10b981': '#059669',
          '#0ea5e9': '#0284c7',
          '#f97316': '#ea580c',
          '#ec4899': '#db2777',
        }
        set({ accentColor: hex })
        document.documentElement.style.setProperty('--clark-accent', hex)
        document.documentElement.style.setProperty('--clark-accent-hover', hoverMap[hex] || '#FF3333')
      },

      setFontSize: (fontSize) => {
        const scaleMap = { small: '0.9rem', default: '1rem', large: '1.125rem' }
        set({ fontSize })
        document.documentElement.style.setProperty('--font-scale', scaleMap[fontSize])
      },

      setBoldMode: (boldMode) => {
        set({ boldMode })
        document.documentElement.dataset.bold = String(boldMode)
      },

      setLanguage: (language) => {
        set({ language })
        document.documentElement.setAttribute('lang', language)
        if (language === 'ar') {
          document.documentElement.setAttribute('dir', 'rtl')
        } else {
          document.documentElement.setAttribute('dir', 'ltr')
        }
      },

      setDateFormat: (dateFormat) => set({ dateFormat }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setShowHiddenFiles: (showHiddenFiles) => set({ showHiddenFiles }),
      setCrossfadeDuration: (crossfadeDuration) => set({ crossfadeDuration }),
      setGaplessPlayback: (gaplessPlayback) => set({ gaplessPlayback }),
      setNormalization: (normalization) => set({ normalization }),

      setEqPreset: (eqPreset) => {
        const bands = EQ_PRESETS[eqPreset] || DEFAULT_EQ_BANDS
        set({ eqPreset, eqBands: [...bands] })
      },

      setEqBand: (index, value) => {
        const bands = [...get().eqBands]
        bands[index] = value
        set({ eqBands: bands, eqPreset: 'Custom' })
      },

      setSleepTimer: async (expiresAt: number | null) => {
        set({ sleepTimer: expiresAt })
        const url = '/api/v1/player/sleep-timer'
        if (expiresAt) {
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expires_at: expiresAt }),
          })
        } else {
          await fetch(url, { method: 'DELETE' })
        }
      },
    }),
    {
      name: 'clark_settings',
      partialize: (state) => ({
        theme: state.theme,
        accentColor: state.accentColor,
        fontSize: state.fontSize,
        boldMode: state.boldMode,
        language: state.language,
        dateFormat: state.dateFormat,
        timeFormat: state.timeFormat,
        showHiddenFiles: state.showHiddenFiles,
        crossfadeDuration: state.crossfadeDuration,
        gaplessPlayback: state.gaplessPlayback,
        normalization: state.normalization,
        eqPreset: state.eqPreset,
        eqBands: state.eqBands,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.dataset.theme = state.theme
          document.documentElement.style.setProperty('--clark-accent', state.accentColor)
          const hoverMap: Record<string, string> = {
            '#E02020': '#FF3333',
            '#CC1A1A': '#E02020',
          }
          document.documentElement.style.setProperty('--clark-accent-hover', hoverMap[state.accentColor] || '#FF3333')
          const scaleMap = { small: '0.9rem', default: '1rem', large: '1.125rem' }
          document.documentElement.style.setProperty('--font-scale', scaleMap[state.fontSize])
          document.documentElement.dataset.bold = String(state.boldMode)
          document.documentElement.setAttribute('lang', state.language)
          if (state.language === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl')
          }
        }
      },
    },
  ),
)