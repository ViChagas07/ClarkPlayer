'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useSettingsStore } from '@/store/settingsStore'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'
import {
  Palette,
  Globe,
  FolderOpen,
  Headphones,
  Info,
  Check,
  FolderPlus,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  HelpCircle,
} from 'lucide-react'

const ACCENT_COLORS = [
  { name: 'Red', hex: '#E02020' },
  { name: 'Crimson', hex: '#CC1A1A' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Sky', hex: '#0ea5e9' },
]

const LANGUAGES = [
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
]

const EQ_PRESETS = ['Normal', 'Classical', 'Dance', 'Folk', 'Heavy Metal', 'Hip-Hop', 'Jazz', 'Pop', 'Rock', 'Custom']
const EQ_FREQUENCIES = ['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz']

const SUPPORTED_FORMATS = [
  { name: 'MP3', color: 'bg-clark-steel/20 text-clark-text-muted' },
  { name: 'FLAC', color: 'bg-clark-steel/20 text-clark-text-muted' },
  { name: 'WAV', color: 'bg-emerald-500/20 text-emerald-400' },
  { name: 'AAC', color: 'bg-clark-gold/20 text-clark-gold' },
  { name: 'M4A', color: 'bg-clark-sky/20 text-clark-sky' },
  { name: 'OGG', color: 'bg-emerald-500/20 text-emerald-400' },
  { name: 'OPUS', color: 'bg-purple-500/20 text-purple-400' },
  { name: 'AIFF', color: 'bg-cyan-400/20 text-cyan-400' },
  { name: 'WMA', color: 'bg-clark-accent/20 text-clark-accent' },
  { name: 'MIDI', color: 'bg-pink-500/20 text-pink-400' },
]

const TABS = [
  { id: 'appearance', labelKey: 'appearance' as const, icon: Palette },
  { id: 'language', labelKey: 'language' as const, icon: Globe },
  { id: 'library', labelKey: 'libraryFiles' as const, icon: FolderOpen },
  { id: 'playback', labelKey: 'playback' as const, icon: Headphones },
  { id: 'about', labelKey: 'about' as const, icon: Info },
]

function ThemeSwatch({ theme, label, isActive, onClick }: { theme: string; label: string; isActive: boolean; onClick: () => void }) {
  const bgMap: Record<string, string> = {
    dark: '#070E2B',
    light: '#EEF2FF',
    midnight: '#000000',
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
        isActive ? 'border-clark-gold bg-clark-accent/10' : 'border-clark-steel/40 hover:border-clark-steel/60',
      )}
      role="radio"
      aria-checked={isActive}
      aria-label={`${label} theme`}
    >
      <div
        className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-clark-steel/30 relative"
        style={{ backgroundColor: bgMap[theme] }}
      >
        <div className={cn('absolute inset-y-0 left-0 w-1/4', theme === 'light' ? 'bg-zinc-200' : 'bg-white/10')} />
        <div className={cn('absolute bottom-0 inset-x-0 h-1/4', theme === 'light' ? 'bg-zinc-100' : 'bg-white/5')} />
      </div>
      {/* font-condensed uppercase tracking-wider */}
      <span className={cn('font-condensed text-xs uppercase tracking-wider', isActive ? 'text-clark-accent' : 'text-clark-text-muted')}>{label}</span>
      {isActive && <Check className="w-4 h-4 text-clark-gold" />}
    </button>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors',
        checked ? 'bg-clark-accent' : 'bg-clark-steel/40',
      )}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <div className={cn(
        'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0.5',
      )} />
    </button>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('appearance')
  const {
    theme, setTheme, accentColor, setAccentColor, fontSize, setFontSize,
    boldMode, setBoldMode,
    language, setLanguage, dateFormat, setDateFormat, timeFormat, setTimeFormat,
    showHiddenFiles, setShowHiddenFiles, crossfadeDuration, setCrossfadeDuration,
    gaplessPlayback, setGaplessPlayback, normalization, setNormalization,
    eqPreset, setEqPreset, eqBands, setEqBand, sleepTimer, setSleepTimer,
  } = useSettingsStore()

  // Read active tab from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab && TABS.some((t) => t.id === tab)) setActiveTab(tab)
  }, [])

  // Sync active tab to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('tab', activeTab)
    window.history.replaceState(null, '', `?${params.toString()}`)
  }, [activeTab])

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        {/* font-display uppercase tracking-widest */}
        <h1 className="font-display text-3xl tracking-widest uppercase mb-8">{t('settings')}</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar tabs */}
          <nav className="lg:w-60 flex-shrink-0" aria-label="Settings sections">
            <ul className="space-y-1" role="tablist">
              {TABS.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg font-body font-medium text-sm transition-colors text-left',
                      activeTab === tab.id
                        ? 'text-clark-gold border-l-2 border-clark-accent bg-clark-bg-secondary'
                        : 'text-clark-text-muted hover:text-clark-text-primary hover:bg-clark-bg-secondary',
                    )}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    {t(tab.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <div className="flex-1 space-y-8">
            {/* Appearance */}
            {activeTab === 'appearance' && (
              <>
                <section>
                  {/* font-display tracking-wider */}
                  <h2 className="font-display tracking-wider text-xl mb-4 text-clark-text-primary">{t('theme')}</h2>
                  <div className="flex gap-4" role="radiogroup" aria-label={t('theme')}>
                    <ThemeSwatch theme="dark" label={t('dark')} isActive={theme === 'dark'} onClick={() => setTheme('dark')} />
                    <ThemeSwatch theme="light" label={t('light')} isActive={theme === 'light'} onClick={() => setTheme('light')} />
                    <ThemeSwatch theme="midnight" label={t('midnight')} isActive={theme === 'midnight'} onClick={() => setTheme('midnight')} />
                  </div>
                </section>

                <section>
                  {/* font-display tracking-wider */}
                  <h2 className="font-display tracking-wider text-xl mb-4 text-clark-text-primary">{t('accentColor')}</h2>
                  <div className="flex gap-3 flex-wrap">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setAccentColor(c.hex)}
                        className={cn(
                          'w-8 h-8 rounded-full transition-transform hover:scale-110',
                          accentColor === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-clark-bg-primary' : '',
                        )}
                        style={{ backgroundColor: c.hex }}
                        aria-label={`${c.name} accent color`}
                        title={c.name}
                      >
                        {accentColor === c.hex && <Check className="w-4 h-4 text-white mx-auto" />}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  {/* font-display tracking-wider */}
                  <h2 className="font-display tracking-wider text-xl mb-4 text-clark-text-primary">{t('fontSize')}</h2>
                  <div className="flex gap-4">
                    {(['small', 'default', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={cn(
                          'px-5 py-2.5 rounded-lg font-body font-medium text-sm transition-colors',
                          fontSize === size ? 'bg-clark-accent text-white' : 'bg-clark-bg-secondary text-clark-text-muted hover:text-clark-text-primary',
                        )}
                      >
                        {t(size)}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  {/* font-display tracking-wider */}
                  <h2 className="font-display tracking-wider text-xl mb-4 text-clark-text-primary">{t('boldMode')}</h2>
                  <div className="flex items-center gap-4">
                    <Toggle checked={boldMode} onChange={setBoldMode} label={t('boldMode')} />
                    <span className="font-body text-sm text-clark-text-muted">{t('boldModeDesc')}</span>
                  </div>
                </section>
              </>
            )}

            {/* Language */}
            {activeTab === 'language' && (
              <>
                <section>
                  {/* font-display tracking-wider */}
                  <h2 className="font-display tracking-wider text-xl mb-4 text-clark-text-primary">{t('language')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm transition-colors',
                          language === lang.code
                            ? 'bg-clark-accent/10 text-clark-accent border border-clark-accent/30'
                            : 'bg-clark-bg-secondary text-clark-text-muted hover:bg-clark-bg-card',
                        )}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                        {language === lang.code && <Check className="w-4 h-4 ml-auto" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 p-4 rounded-lg bg-clark-bg-secondary border border-clark-steel/20">
                    <h3 className="font-body font-semibold text-sm mb-2 text-clark-text-primary">{t('translationContributors')}</h3>
                    <p className="font-body text-xs text-clark-text-muted">
                      {t('translationThanks')}
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="font-display tracking-wider text-xl mb-4 text-clark-text-primary">{t('dateTimeFormat')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-body font-medium text-sm mb-2 text-clark-text-primary">{t('dateFormat')}</label>
                      <select
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value as typeof dateFormat)}
                        className="w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border border-clark-steel/40 font-body focus:outline-none focus:ring-2 focus:ring-clark-gold"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-body font-medium text-sm mb-2 text-clark-text-primary">{t('timeFormat')}</label>
                      <select
                        value={timeFormat}
                        onChange={(e) => setTimeFormat(e.target.value as typeof timeFormat)}
                        className="w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border border-clark-steel/40 font-body focus:outline-none focus:ring-2 focus:ring-clark-gold"
                      >
                        <option value="12h">12-hour (AM/PM)</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Library & Files */}
            {activeTab === 'library' && (
              <>
                <section>
                  <div className="flex items-center justify-between mb-4">
                    {/* font-display tracking-wider */}
                    <h2 className="font-display tracking-wider text-xl text-clark-text-primary">{t('folderScanning')}</h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-clark-accent hover:bg-clark-accent-hover font-body font-semibold text-sm text-white rounded-lg transition-colors">
                      <RefreshCw className="w-4 h-4" />
                      {t('scanNow')}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { path: 'C:\\Users\\Clark\\Music', files: 1243, scanned: '2 hours ago' },
                      { path: 'D:\\Podcasts', files: 87, scanned: '1 day ago' },
                    ].map((folder, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-clark-bg-secondary border border-clark-steel/20">
                        <div>
                          {/* font-body font-medium */}
                          <p className="font-body font-medium text-sm text-clark-text-primary">{folder.path}</p>
                          <p className="font-body text-xs text-clark-text-muted">{folder.files} files · Scanned {folder.scanned}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-clark-text-muted hover:text-clark-text-primary transition-colors" aria-label="Rescan">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-clark-danger hover:text-clark-danger/80 transition-colors" aria-label="Remove">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-clark-bg-secondary hover:bg-clark-bg-card text-clark-text-muted font-body font-medium text-sm rounded-lg transition-colors border border-clark-steel/40 border-dashed">
                    <FolderPlus className="w-4 h-4" />
                    Add folder
                  </button>
                </section>

                <section>
                  {/* font-display tracking-wider */}
                  <h2 className="font-display tracking-wider text-xl mb-4 text-clark-text-primary">{t('hiddenFiles')}</h2>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-clark-bg-secondary border border-clark-steel/20">
                    <div className="flex items-center gap-3">
                      {showHiddenFiles ? <Eye className="w-5 h-5 text-clark-text-muted" /> : <EyeOff className="w-5 h-5 text-clark-text-muted" />}
                      <div>
                        <p className="font-body font-medium text-sm text-clark-text-primary">{t('showHiddenFiles')}</p>
                        <p className="font-body text-xs text-clark-text-muted">
                          {t('hiddenFilesDesc')}
                        </p>
                      </div>
                    </div>
                    <Toggle checked={showHiddenFiles} onChange={setShowHiddenFiles} label={t('showHiddenFiles')} />
                  </div>
                </section>

                <section>
                  {/* font-display tracking-wider */}
                  <h2 className="font-display tracking-wider text-xl mb-4 text-clark-text-primary">{t('supportedFormats')}</h2>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTED_FORMATS.map((fmt) => (
                      <span key={fmt.name} className={cn('px-3 py-1.5 rounded-full font-condensed text-xs uppercase tracking-wide', fmt.color)}>
                        {fmt.name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 font-body text-xs text-clark-text-muted">
                    {t('unsupportedFormat')}{' '}
                    <a href="mailto:support@clarkplayer.com" className="text-clark-sky hover:underline">{t('letUsKnow')}</a>
                  </p>
                </section>

                <section>
                  {/* font-display tracking-wider */}
                  <h2 className="font-display tracking-wider text-xl mb-4 text-clark-text-primary">{t('storageUsage')}</h2>
                  <div className="p-4 rounded-lg bg-clark-bg-secondary border border-clark-steel/20">
                    <div className="flex items-center justify-between font-body text-sm mb-2 text-clark-text-muted">
                      <span>24.7 GB used of 100 GB</span>
                      <span className="text-clark-text-muted/50">24.7%</span>
                    </div>
                    <div className="h-3 bg-clark-steel/20 rounded-full overflow-hidden flex">
                      <div className="h-full bg-clark-accent" style={{ width: '18%' }} title="Audio files" />
                      <div className="h-full bg-violet-500" style={{ width: '4%' }} title="Cached artwork" />
                      <div className="h-full bg-clark-gold" style={{ width: '2.7%' }} title="Downloaded lyrics" />
                    </div>
                    <div className="flex gap-4 mt-3 font-body text-xs text-clark-text-muted">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-clark-accent" /> Audio files (18 GB)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Cached artwork (4 GB)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-clark-gold" /> Lyrics (2.7 GB)
                      </span>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Playback */}
            {activeTab === 'playback' && (
              <>
                <section>
                  {/* font-display tracking-wider */}
                  <h2 className="font-display tracking-wider text-xl mb-4 text-clark-text-primary">{t('equalizer')}</h2>
                  <div className="mb-4">
                    <label className="block font-body font-medium text-sm mb-2 text-clark-text-primary">{t('preset')}</label>
                    <select
                      value={eqPreset}
                      onChange={(e) => setEqPreset(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border border-clark-steel/40 font-body focus:outline-none focus:ring-2 focus:ring-clark-gold"
                    >
                      {EQ_PRESETS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4 rounded-lg bg-clark-bg-secondary border border-clark-steel/20">
                    <div className="flex items-end justify-between gap-1 h-48">
                      {EQ_FREQUENCIES.map((freq, i) => (
                        <div key={freq} className="flex flex-col items-center flex-1 min-w-0 h-full">
                          <span className="font-condensed text-xs text-clark-text-muted tabular-nums mb-1 shrink-0">
                            {eqBands[i] > 0 ? '+' : ''}{eqBands[i]}dB
                          </span>
                          <div className="flex-1 flex items-center justify-center">
                            <input
                              type="range"
                              min="-12"
                              max="12"
                              step="1"
                              value={eqBands[i]}
                              onChange={(e) => setEqBand(i, parseInt(e.target.value))}
                              className="appearance-none cursor-pointer rounded-full"
                              style={{
                                transform: 'rotate(-90deg)',
                                width: '96px',
                                height: '4px',
                                background: `linear-gradient(to right, #F5C518 ${((eqBands[i] + 12) / 24) * 100}%, #0D1B4B ${((eqBands[i] + 12) / 24) * 100}%)`,
                              }}
                              aria-label={`${freq}, current value: ${eqBands[i]} dB`}
                            />
                          </div>
                          <span className="font-condensed text-[10px] text-clark-text-muted mt-1 shrink-0">
                            {freq}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  {/* font-display tracking-wider */}
                  <h2 className="font-display tracking-wider text-xl mb-4 text-clark-text-primary">{t('playbackOptions')}</h2>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-clark-bg-secondary border border-clark-steel/20">
                    <div>
                      <p className="font-body font-medium text-sm text-clark-text-primary">{t('crossfade')}</p>
                      <p className="font-body text-xs text-clark-text-muted">{t('crossfadeDesc')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="12"
                        value={crossfadeDuration}
                        onChange={(e) => setCrossfadeDuration(parseInt(e.target.value))}
                        className="w-24 h-1 cursor-pointer"
                        disabled={crossfadeDuration === 0}
                        aria-label={t('crossfade')}
                      />
                      <span className="font-body text-sm text-clark-text-muted w-12 text-right tabular-nums">
                        {crossfadeDuration === 0 ? t('off') : `${crossfadeDuration}s`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-clark-bg-secondary border border-clark-steel/20">
                    <div>
                      <p className="font-body font-medium text-sm text-clark-text-primary">{t('gapless')}</p>
                      <p className="font-body text-xs text-clark-text-muted">{t('gaplessDesc')}</p>
                    </div>
                    <Toggle checked={gaplessPlayback} onChange={setGaplessPlayback} label={t('gapless')} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-clark-bg-secondary border border-clark-steel/20">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-body font-medium text-sm text-clark-text-primary">{t('normalization')}</p>
                        <p className="font-body text-xs text-clark-text-muted">{t('normalizationDesc')}</p>
                      </div>
                      <HelpCircle className="w-4 h-4 text-clark-text-muted cursor-help" />
                    </div>
                    <Toggle checked={normalization} onChange={setNormalization} label={t('normalization')} />
                  </div>
                </section>

                <section>
                  {/* font-display tracking-wider */}
                  <h2 className="font-display tracking-wider text-xl mb-4 text-clark-text-primary">{t('sleepTimer')}</h2>
                  <div className="flex items-center gap-3">
                    <select
                      value={sleepTimer ?? '0'}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '0') setSleepTimer(null)
                        else if (val === 'end') setSleepTimer(-1)  // -1 = end of track
                        else setSleepTimer(parseInt(val))
                      }}
                      className="h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border border-clark-steel/40 font-body focus:outline-none focus:ring-2 focus:ring-clark-gold"
                    >
                      <option value="0">{t('off')}</option>
                      <option value="900000">15 {t('min')}</option>
                      <option value="1800000">30 {t('min')}</option>
                      <option value="2700000">45 {t('min')}</option>
                      <option value="3600000">1 {t('hour')}</option>
                      <option value="end">{t('endOfTrack')}</option>
                    </select>
                    {sleepTimer && (
                      <button
                        onClick={() => setSleepTimer(null)}
                        className="px-4 py-2.5 bg-clark-danger/20 hover:bg-clark-danger/30 font-body font-medium text-sm text-clark-danger rounded-lg transition-colors"
                      >
                        {t('cancelTimer')}
                      </button>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* About */}
            {activeTab === 'about' && (
              <div className="text-center space-y-8">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-clark-bg-card flex items-center justify-center shadow-glow-gold ring-2 ring-clark-gold/40 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="ClarkPlayer" className="w-full h-full object-contain p-1" />
                </div>
                <div>
                  {/* font-display uppercase tracking-widest */}
                  <h2 className="font-display text-2xl tracking-widest uppercase text-clark-text-primary">ClarkPlayer</h2>
                  <p className="font-body text-clark-text-muted">{t('version')} 0.1.0 · Built {new Date().toLocaleDateString()}</p>
                </div>

                <div className="text-left max-w-md mx-auto">
                  {/* font-display tracking-wider */}
                  <h3 className="font-display tracking-wider text-lg mb-3 text-clark-text-primary">{t('whatsNew')}</h3>
                  <ul className="space-y-3 font-body text-sm text-clark-text-muted">
                    <li className="flex gap-3">
                      <span className="font-medium text-clark-accent">v0.1.0</span>
                      <span>Initial release — full audio library management</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-clark-text-muted/50 font-medium">v0.0.3</span>
                      <span>Added playlist collaboration and EQ presets</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-clark-text-muted/50 font-medium">v0.0.2</span>
                      <span>Improved streaming performance and dark mode</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-clark-text-muted/50 font-medium">v0.0.1</span>
                      <span>Alpha — basic playback and library browsing</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap justify-center gap-4 font-body text-sm text-clark-text-muted">
                  <a href="#" className="hover:text-clark-sky transition-colors">Privacy Policy</a>
                  <span className="text-clark-steel/40">·</span>
                  <a href="#" className="hover:text-clark-sky transition-colors">Terms of Service</a>
                  <span className="text-clark-steel/40">·</span>
                  <a href="#" className="hover:text-clark-sky transition-colors">Open Source Licenses</a>
                </div>

                <p className="font-body text-xs text-clark-text-muted/50">Made with ♥ by the ClarkPlayer team</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}