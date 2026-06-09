"use client";

import { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, Clock, X } from "lucide-react";
import type { Track, Album, Artist, Playlist } from "@/types";
import { usePlayerStore } from "@/store/playerStore";
import { TrackCard } from "@/components/library/TrackCard";
import { AlbumCard } from "@/components/library/AlbumCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const MOCK_RESULTS: {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
} = {
  tracks: [
    { id: "t1", title: "Electric Dreams", artist: "Lena Ray", album: "Midnight Echoes", genre: "Electronic", year: 2023, duration: 234, fileSize: 4800000, fileFormat: "mp3", coverArtPath: null, playCount: 1240, lastPlayedAt: null, isFavorite: false, createdAt: "", updatedAt: "" },
    { id: "t2", title: "Running in Circles", artist: "The Wanderers", album: "Velvet Horizons", genre: "Indie", year: 2022, duration: 198, fileSize: 4100000, fileFormat: "flac", coverArtPath: null, playCount: 890, lastPlayedAt: null, isFavorite: true, createdAt: "", updatedAt: "" },
    { id: "t3", title: "Static Blue", artist: "Nova Pulse", album: "Crystal Static", genre: "Ambient", year: 2024, duration: 312, fileSize: 6400000, fileFormat: "flac", coverArtPath: null, playCount: 567, lastPlayedAt: null, isFavorite: false, createdAt: "", updatedAt: "" },
  ],
  albums: [
    { id: "1", name: "Midnight Echoes", artist: "Lena Ray", year: 2023, coverArtPath: null, trackCount: 12, duration: 2820 },
    { id: "2", name: "Crystal Static", artist: "Nova Pulse", year: 2024, coverArtPath: null, trackCount: 14, duration: 3200 },
  ],
  artists: [
    { id: "a1", name: "Lena Ray", avatarUrl: null, trackCount: 24, albumCount: 3 },
    { id: "a2", name: "Nova Pulse", avatarUrl: null, trackCount: 18, albumCount: 2 },
  ],
  playlists: [
    { id: "p1", name: "Late Night Focus", description: "Deep focus tracks for night owls.", coverArtPath: null, visibility: "private", trackCount: 18, createdAt: "", updatedAt: "" },
    { id: "p2", name: "Morning Energy", description: "Start your day right.", coverArtPath: null, visibility: "public", trackCount: 12, createdAt: "", updatedAt: "" },
  ],
};

const RECENT_KEY = "clarkplayer-recent-searches";
const MAX_RECENT = 8;

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const prev = getRecentSearches().filter((s) => s !== term);
  const next = [term, ...prev].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playTrack, setQueue } = usePlayerStore();

  useEffect(() => { setRecentSearches(getRecentSearches()); }, []);
  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        saveRecentSearch(query.trim());
        setRecentSearches(getRecentSearches());
      }
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = debouncedQuery
    ? {
        tracks: MOCK_RESULTS.tracks.filter((t) => t.title.toLowerCase().includes(debouncedQuery.toLowerCase()) || (t.artist ?? "").toLowerCase().includes(debouncedQuery.toLowerCase())),
        albums: MOCK_RESULTS.albums.filter((a) => a.name.toLowerCase().includes(debouncedQuery.toLowerCase()) || a.artist.toLowerCase().includes(debouncedQuery.toLowerCase())),
        artists: MOCK_RESULTS.artists.filter((ar) => ar.name.toLowerCase().includes(debouncedQuery.toLowerCase())),
        playlists: MOCK_RESULTS.playlists.filter((pl) => pl.name.toLowerCase().includes(debouncedQuery.toLowerCase())),
      }
    : { tracks: [], albums: [], artists: [], playlists: [] };

  const hasResults = results.tracks.length > 0 || results.albums.length > 0 || results.artists.length > 0 || results.playlists.length > 0;

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="relative mb-8">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          type="search"
          aria-label="Search music library"
          placeholder="Search tracks, albums, artists, playlists…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-secondary border border-white/5 text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
        />
        {query && (
          <button aria-label="Clear search" onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded text-muted hover:text-body transition-colors cursor-pointer">
            <X size={16} />
          </button>
        )}
      </div>

      {!isLoading && !debouncedQuery && (
        recentSearches.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Recent Searches</h2>
              <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecentSearches([]); }} className="text-xs text-muted hover:text-body transition-colors cursor-pointer">Clear all</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button key={term} onClick={() => setQuery(term)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-secondary border border-white/5 text-sm text-body hover:bg-bg-tertiary transition-all duration-200 cursor-pointer">
                  <Clock size={12} className="text-muted" />{term}
                  <X size={12} className="text-muted hover:text-danger transition-colors" onClick={(e) => { e.stopPropagation(); const next = recentSearches.filter((s) => s !== term); localStorage.setItem(RECENT_KEY, JSON.stringify(next)); setRecentSearches(next); }} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState heading="Search your music" subtext="Find tracks, albums, artists, and playlists instantly." icon={<SearchIcon size={48} />} />
        )
      )}

      {!isLoading && debouncedQuery && !hasResults && (
        <EmptyState heading={`No results for "${debouncedQuery}"`} subtext="Try searching for something else." icon={<SearchIcon size={48} />} />
      )}

      {!isLoading && hasResults && (
        <div className="space-y-8">
          {results.tracks.length > 0 && (
            <section aria-labelledby="tracks-heading">
              <h2 id="tracks-heading" className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Tracks</h2>
              <div className="space-y-1">
                {results.tracks.map((track, idx) => (
                  <TrackCard key={track.id} track={track} index={idx} view="list" onPlay={(t) => { playTrack(t); setQueue(results.tracks, idx); }} />
                ))}
              </div>
            </section>
          )}
          {results.albums.length > 0 && (
            <section aria-labelledby="albums-heading">
              <h2 id="albums-heading" className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.albums.map((album) => <AlbumCard key={album.id} album={album} onPlay={() => {}} />)}
              </div>
            </section>
          )}
          {results.artists.length > 0 && (
            <section aria-labelledby="artists-heading">
              <h2 id="artists-heading" className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.artists.map((artist) => (
                  <div key={artist.id} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-bg-tertiary cursor-pointer hover:bg-bg-tertiary/80 transition-all duration-200">
                    <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-accent">{artist.name.charAt(0)}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-heading">{artist.name}</p>
                      <p className="text-xs text-muted">{artist.trackCount} tracks</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {results.playlists.length > 0 && (
            <section aria-labelledby="playlists-heading">
              <h2 id="playlists-heading" className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.playlists.map((playlist) => (
                  <div key={playlist.id} className="group rounded-xl bg-bg-tertiary p-3 space-y-3 cursor-pointer hover:bg-bg-tertiary/80 transition-all duration-200">
                    <div className="aspect-square rounded-xl bg-accent/20 flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 3.5C3 3.5 6 2 8 4C10 6 13 4.5 13 4.5V11.5C13 11.5 10 10 8 12C6 14 3 12.5 3 12.5V3.5Z" fill="#6366F1" opacity="0.6" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-heading truncate">{playlist.name}</p>
                      <p className="text-xs text-muted truncate">{playlist.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
