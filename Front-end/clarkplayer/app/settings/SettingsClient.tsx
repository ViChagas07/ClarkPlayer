"use client";

import { useState } from "react";
import { Volume2, FolderSync, Palette, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AccentColor } from "@/types";

const SECTIONS = [
  { id: "playback", label: "Playback", icon: Volume2 },
  { id: "library", label: "Library", icon: FolderSync },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "about", label: "About", icon: Info },
] as const;

type Section = (typeof SECTIONS)[number]["id"];

interface SettingsStore {
  crossfade: boolean;
  crossfadeDuration: number;
  gaplessPlayback: boolean;
  equalizerPreset: string;
  scanFolders: string[];
  accentColor: AccentColor;
  setCrossfade: (v: boolean) => void;
  setCrossfadeDuration: (v: number) => void;
  setGaplessPlayback: (v: boolean) => void;
  setEqualizerPreset: (v: string) => void;
  setScanFolders: (v: string[]) => void;
  setAccentColor: (v: AccentColor) => void;
}

const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      crossfade: false,
      crossfadeDuration: 3,
      gaplessPlayback: true,
      equalizerPreset: "Flat",
      scanFolders: [],
      accentColor: "indigo",
      setCrossfade: (v) => set({ crossfade: v }),
      setCrossfadeDuration: (v) => set({ crossfadeDuration: v }),
      setGaplessPlayback: (v) => set({ gaplessPlayback: v }),
      setEqualizerPreset: (v) => set({ equalizerPreset: v }),
      setScanFolders: (v) => set({ scanFolders: v }),
      setAccentColor: (v) => set({ accentColor: v }),
    }),
    { name: "clarkplayer-settings" }
  )
);

const ACCENT_COLORS: { id: AccentColor; label: string; value: string }[] = [
  { id: "indigo", label: "Indigo", value: "#6366F1" },
  { id: "violet", label: "Violet", value: "#8B5CF6" },
  { id: "blue", label: "Blue", value: "#3B82F6" },
  { id: "emerald", label: "Emerald", value: "#10B981" },
  { id: "rose", label: "Rose", value: "#F43F5E" },
];

const EQ_PRESETS = ["Flat", "Bass Boost", "Treble Boost", "Vocal", "Electronic", "Hip-Hop", "Jazz", "Classical", "Rock"];

export default function SettingsClient() {
  const [activeSection, setActiveSection] = useState<Section>("playback");
  const {
    crossfade, crossfadeDuration, gaplessPlayback, equalizerPreset, scanFolders, accentColor,
    setCrossfade, setCrossfadeDuration, setGaplessPlayback, setEqualizerPreset, setScanFolders, setAccentColor,
  } = useSettingsStore();

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-heading tracking-tight mb-8">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <nav aria-label="Settings sections" className="lg:w-48 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer",
                  activeSection === id ? "bg-accent/10 text-accent" : "text-muted hover:text-body hover:bg-bg-tertiary"
                )}
              >
                <Icon size={16} />{label}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {activeSection === "playback" && (
            <div className="space-y-8 max-w-lg">
              <div>
                <h2 className="text-base font-semibold text-heading mb-4">Equalizer</h2>
                <div className="space-y-2">
                  <label htmlFor="eq-preset" className="text-sm text-muted">Preset</label>
                  <select
                    id="eq-preset"
                    value={equalizerPreset}
                    onChange={(e) => setEqualizerPreset(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-white/5 text-sm text-body focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 cursor-pointer"
                  >
                    {EQ_PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <h2 className="text-base font-semibold text-heading mb-4">Transitions</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-body">Crossfade</p>
                      <p className="text-xs text-muted">Overlap between tracks</p>
                    </div>
                    <div onClick={() => setCrossfade(!crossfade)} className={cn("relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer", crossfade ? "bg-accent" : "bg-bg-tertiary")} role="switch" aria-checked={crossfade}>
                      <div className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200", crossfade && "translate-x-5")} />
                    </div>
                  </label>

                  {crossfade && (
                    <div className="space-y-2">
                      <label htmlFor="crossfade-duration" className="text-sm text-muted">Duration ({crossfadeDuration}s)</label>
                      <input id="crossfade-duration" type="range" min={1} max={10} value={crossfadeDuration} onChange={(e) => setCrossfadeDuration(Number(e.target.value))} className="w-full accent-accent" />
                    </div>
                  )}

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-body">Gapless playback</p>
                      <p className="text-xs text-muted">No silence between tracks</p>
                    </div>
                    <div onClick={() => setGaplessPlayback(!gaplessPlayback)} className={cn("relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer", gaplessPlayback ? "bg-accent" : "bg-bg-tertiary")} role="switch" aria-checked={gaplessPlayback}>
                      <div className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200", gaplessPlayback && "translate-x-5")} />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === "library" && (
            <div className="space-y-8 max-w-lg">
              <div>
                <h2 className="text-base font-semibold text-heading mb-4">Watched Folders</h2>
                <div className="space-y-2">
                  <p className="text-sm text-muted mb-2">Folders that ClarkPlayer scans for music files.</p>
                  {scanFolders.length === 0 ? (
                    <p className="text-sm text-muted italic">No folders added yet.</p>
                  ) : (
                    <ul className="space-y-1">
                      {scanFolders.map((folder) => (
                        <li key={folder} className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg-tertiary text-sm">
                          <span className="text-body truncate">{folder}</span>
                          <button onClick={() => setScanFolders(scanFolders.filter((f) => f !== folder))} className="text-muted hover:text-danger transition-colors text-xs cursor-pointer">Remove</button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button onClick={() => { const path = prompt("Enter folder path:"); if (path?.trim()) setScanFolders([...scanFolders, path.trim()]); }} className="w-full mt-2 px-4 py-2 rounded-lg border border-dashed border-white/20 text-sm text-muted hover:text-body hover:border-white/40 transition-all duration-200 cursor-pointer">+ Add folder</button>
                </div>
              </div>
              <div>
                <h2 className="text-base font-semibold text-heading mb-4">File Types</h2>
                <p className="text-sm text-muted">Supported formats: MP3, FLAC, WAV, AAC, OGG, WMA, M4A, OPUS</p>
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="space-y-8 max-w-lg">
              <div>
                <h2 className="text-base font-semibold text-heading mb-4">Accent Color</h2>
                <div className="flex flex-wrap gap-3">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color.id}
                      aria-label={`Set accent color to ${color.label}`}
                      onClick={() => setAccentColor(color.id)}
                      className={cn("w-10 h-10 rounded-full transition-all duration-200 cursor-pointer hover:scale-105", accentColor === color.id ? "scale-110 ring-2 ring-offset-2 ring-offset-bg-primary" : "")}
                      style={{ backgroundColor: color.value, outlineColor: accentColor === color.id ? color.value : "transparent", outline: "2px solid transparent" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "about" && (
            <div className="space-y-6 max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 3.5C3 3.5 6 2 8 4C10 6 13 4.5 13 4.5V11.5C13 11.5 10 10 8 12C6 14 3 12.5 3 12.5V3.5Z" fill="white" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">ClarkPlayer</h2>
                  <p className="text-sm text-muted">Version 0.1.0</p>
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed">ClarkPlayer is a sleek, powerful media player for all your music. Built with Next.js, Tailwind CSS, and FastAPI.</p>
              <div className="space-y-2 text-sm text-muted">
                <p><span className="text-body font-medium">Frontend:</span> Next.js 16 · React 19 · Tailwind CSS v4 · Zustand</p>
                <p><span className="text-body font-medium">Backend:</span> Python 3.14 · FastAPI · SQLAlchemy 2.0 (async)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
