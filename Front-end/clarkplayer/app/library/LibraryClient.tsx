"use client";

import { useState } from "react";
import { Search, LayoutGrid, List, Music } from "lucide-react";
import type { Album, Track } from "@/types";
import { usePlayerStore } from "@/store/playerStore";
import { AlbumCard } from "@/components/library/AlbumCard";
import { TrackCard } from "@/components/library/TrackCard";
import { TrackCardSkeleton, AlbumCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type Tab = "all" | "albums" | "artists" | "playlists" | "folders";
type ViewMode = "grid" | "list";
type SortOption = "az" | "recent" | "played";

const SORT_LABELS: Record<SortOption, string> = {
  az: "A–Z",
  recent: "Recently Added",
  played: "Most Played",
};

const MOCK_ALBUMS: Album[] = [
  { id: "1", name: "Midnight Echoes", artist: "Lena Ray", year: 2023, coverArtPath: null, trackCount: 12, duration: 2820 },
  { id: "2", name: "Velvet Horizons", artist: "The Wanderers", year: 2022, coverArtPath: null, trackCount: 9, duration: 2100 },
  { id: "3", name: "Crystal Static", artist: "Nova Pulse", year: 2024, coverArtPath: null, trackCount: 14, duration: 3200 },
  { id: "4", name: "Parallel Lines", artist: "Ingrid Blaze", year: 2021, coverArtPath: null, trackCount: 8, duration: 1900 },
  { id: "5", name: "Neon Tide", artist: "Coral Sea", year: 2023, coverArtPath: null, trackCount: 11, duration: 2600 },
  { id: "6", name: "Quiet Explosions", artist: "Felix Dale", year: 2022, coverArtPath: null, trackCount: 10, duration: 2400 },
];

const MOCK_TRACKS: Track[] = [
  { id: "t1", title: "Electric Dreams", artist: "Lena Ray", album: "Midnight Echoes", genre: "Electronic", year: 2023, duration: 234, fileSize: 4800000, fileFormat: "mp3", coverArtPath: null, playCount: 1240, lastPlayedAt: null, isFavorite: false, createdAt: "", updatedAt: "" },
  { id: "t2", title: "Running in Circles", artist: "The Wanderers", album: "Velvet Horizons", genre: "Indie", year: 2022, duration: 198, fileSize: 4100000, fileFormat: "flac", coverArtPath: null, playCount: 890, lastPlayedAt: null, isFavorite: true, createdAt: "", updatedAt: "" },
  { id: "t3", title: "Static Blue", artist: "Nova Pulse", album: "Crystal Static", genre: "Ambient", year: 2024, duration: 312, fileSize: 6400000, fileFormat: "flac", coverArtPath: null, playCount: 567, lastPlayedAt: null, isFavorite: false, createdAt: "", updatedAt: "" },
  { id: "t4", title: "Last Transmission", artist: "Ingrid Blaze", album: "Parallel Lines", genre: "Rock", year: 2021, duration: 267, fileSize: 5500000, fileFormat: "mp3", coverArtPath: null, playCount: 2100, lastPlayedAt: null, isFavorite: false, createdAt: "", updatedAt: "" },
  { id: "t5", title: "Coral Reef", artist: "Coral Sea", album: "Neon Tide", genre: "Pop", year: 2023, duration: 203, fileSize: 4200000, fileFormat: "mp3", coverArtPath: null, playCount: 780, lastPlayedAt: null, isFavorite: false, createdAt: "", updatedAt: "" },
];

const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "albums", label: "Albums" },
  { id: "artists", label: "Artists" },
  { id: "playlists", label: "Playlists" },
  { id: "folders", label: "Folders" },
];

export default function LibraryClient() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const [isLoading] = useState(false);
  const { playTrack, setQueue } = usePlayerStore();

  const filteredAlbums = MOCK_ALBUMS.filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.artist.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTracks = MOCK_TRACKS.filter(
    (t) =>
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.artist ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.album ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-heading tracking-tight mb-6">Library</h1>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              aria-label="Search library"
              placeholder="Search tracks, albums, artists…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-bg-secondary border border-white/5 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-1 bg-bg-secondary rounded-lg p-1 border border-white/5">
            {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setSort(opt)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all duration-150",
                  sort === opt ? "bg-accent text-white" : "text-muted hover:text-body"
                )}
              >
                {SORT_LABELS[opt]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-bg-secondary rounded-lg p-1 border border-white/5">
            <button
              aria-label="Grid view"
              onClick={() => setView("grid")}
              className={cn(
                "p-1.5 rounded-md transition-all duration-150",
                view === "grid" ? "bg-accent/20 text-accent" : "text-muted hover:text-body"
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              aria-label="List view"
              onClick={() => setView("list")}
              className={cn(
                "p-1.5 rounded-md transition-all duration-150",
                view === "list" ? "bg-accent/20 text-accent" : "text-muted hover:text-body"
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-all duration-150 -mb-px",
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-body"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <AlbumCardSkeleton key={i} />)}
          </div>
          <div className="space-y-1">
            {Array.from({ length: 6 }).map((_, i) => <TrackCardSkeleton key={i} />)}
          </div>
        </div>
      ) : activeTab === "albums" || activeTab === "all" ? (
        filteredAlbums.length > 0 ? (
          <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" : "space-y-1"}>
            {filteredAlbums.map((album) =>
              view === "grid" ? (
                <AlbumCard key={album.id} album={album} onPlay={() => {}} />
              ) : (
                <div key={album.id} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-tertiary transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-heading truncate">{album.name}</p>
                    <p className="text-xs text-muted truncate">{album.artist}</p>
                  </div>
                  <span className="text-xs text-muted">{album.trackCount} tracks</span>
                </div>
              )
            )}
          </div>
        ) : (
          <EmptyState heading="No albums found" subtext={search ? "Try a different search term." : "Your library is empty."} icon={<Music size={48} />} />
        )
      ) : (
        <EmptyState heading={`No ${activeTab} yet`} subtext="This section is under construction." icon={<Music size={48} />} />
      )}
    </div>
  );
}
