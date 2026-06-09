"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Shuffle, MoreHorizontal, Clock } from "lucide-react";
import type { Track } from "@/types";
import { usePlayerStore } from "@/store/playerStore";
import { TrackListItem } from "@/components/library/TrackListItem";
import { SeekBar } from "@/components/player/SeekBar";
import { VolumeControl } from "@/components/player/VolumeControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDuration } from "@/lib/utils";

interface AlbumClientProps {
  id: string;
}

const MOCK_ALBUM = {
  id: "1",
  name: "Midnight Echoes",
  artist: "Lena Ray",
  year: 2023,
  coverArtPath: null,
  trackCount: 12,
  duration: 2820,
};

const MOCK_TRACKS: Track[] = [
  { id: "t1", title: "Electric Dreams", artist: "Lena Ray", album: "Midnight Echoes", genre: "Electronic", year: 2023, duration: 234, fileSize: 4800000, fileFormat: "mp3", coverArtPath: null, playCount: 1240, lastPlayedAt: null, isFavorite: false, createdAt: "", updatedAt: "" },
  { id: "t2", title: "Running in Circles", artist: "Lena Ray", album: "Midnight Echoes", genre: "Electronic", year: 2023, duration: 198, fileSize: 4100000, fileFormat: "flac", coverArtPath: null, playCount: 890, lastPlayedAt: null, isFavorite: true, createdAt: "", updatedAt: "" },
  { id: "t3", title: "Static Blue", artist: "Lena Ray", album: "Midnight Echoes", genre: "Electronic", year: 2023, duration: 312, fileSize: 6400000, fileFormat: "flac", coverArtPath: null, playCount: 567, lastPlayedAt: null, isFavorite: false, createdAt: "", updatedAt: "" },
  { id: "t4", title: "Last Transmission", artist: "Lena Ray", album: "Midnight Echoes", genre: "Electronic", year: 2023, duration: 267, fileSize: 5500000, fileFormat: "mp3", coverArtPath: null, playCount: 2100, lastPlayedAt: null, isFavorite: false, createdAt: "", updatedAt: "" },
  { id: "t5", title: "Coral Reef", artist: "Lena Ray", album: "Midnight Echoes", genre: "Electronic", year: 2023, duration: 203, fileSize: 4200000, fileFormat: "mp3", coverArtPath: null, playCount: 780, lastPlayedAt: null, isFavorite: false, createdAt: "", updatedAt: "" },
  { id: "t6", title: "Midnight Rain", artist: "Lena Ray", album: "Midnight Echoes", genre: "Electronic", year: 2023, duration: 289, fileSize: 5900000, fileFormat: "flac", coverArtPath: null, playCount: 1450, lastPlayedAt: null, isFavorite: false, createdAt: "", updatedAt: "" },
];

export default function AlbumClient({ id }: AlbumClientProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const {
    currentTrack,
    volume,
    currentTime,
    duration,
    playTrack,
    setQueue,
    seek,
  } = usePlayerStore();

  const album = MOCK_ALBUM;
  const tracks = MOCK_TRACKS;

  if (!album) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState heading="Album not found" subtext="This album doesn't exist." />
      </div>
    );
  }

  const handlePlayAll = () => {
    setQueue(tracks, 0);
    setIsPlaying(true);
  };

  const handleShuffleAll = () => {
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    setQueue(shuffled, 0);
    setIsPlaying(true);
  };

  const handlePlayTrack = (track: Track, index: number) => {
    playTrack(track);
    setQueue(tracks, index);
    setIsPlaying(true);
  };

  const isCurrentAlbum = currentTrack?.album === album.name;

  return (
    <div className="pb-24">
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110 pointer-events-none"
          style={{ backgroundImage: album.coverArtPath ? `url(${album.coverArtPath})` : undefined }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/80 to-bg-primary pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 px-6 pt-12 pb-8 sm:pt-16 sm:pb-12">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 bg-bg-tertiary">
            {album.coverArtPath ? (
              <Image src={album.coverArtPath} alt={album.name} fill priority className="object-cover" sizes="(max-width: 640px) 192px, 224px" />
            ) : (
              <div className="w-full h-full bg-indigo-900/40 flex items-center justify-center">
                <svg width="64" height="64" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 3.5C3 3.5 6 2 8 4C10 6 13 4.5 13 4.5V11.5C13 11.5 10 10 8 12C6 14 3 12.5 3 12.5V3.5Z" fill="#6366F1" opacity="0.6" />
                </svg>
              </div>
            )}
          </div>

          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Album</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-heading tracking-tight mb-2">{album.name}</h1>
            <p className="text-base text-body/80 font-medium mb-1">{album.artist}</p>
            <div className="flex items-center gap-2 text-sm text-muted justify-center sm:justify-start">
              {album.year && <span>{album.year}</span>}
              <span>·</span>
              <span>{album.trackCount} tracks</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock size={12} />{formatDuration(album.duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions + track list */}
      <div className="px-6 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={handlePlayAll} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all duration-200 cursor-pointer">
            <Play size={16} fill="currentColor" />Play All
          </button>
          <button onClick={handleShuffleAll} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-bg-tertiary hover:bg-bg-tertiary/80 text-body text-sm font-semibold transition-all duration-200 cursor-pointer">
            <Shuffle size={16} />Shuffle
          </button>
          <button aria-label="More options" className="p-2 rounded-full bg-bg-tertiary hover:bg-bg-tertiary/80 text-muted transition-all duration-200 cursor-pointer">
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wide border-b border-white/5">
          <span className="w-8 text-center">#</span>
          <span className="flex-1">Title</span>
          <span className="hidden sm:block w-32">Album</span>
          <span className="w-12 text-right">Duration</span>
        </div>

        <ul aria-label={`Tracks in ${album.name}`}>
          {tracks.map((track, idx) => (
            <TrackListItem key={track.id} track={track} index={idx} onPlay={(t) => handlePlayTrack(t, idx)} />
          ))}
        </ul>
      </div>

      {isCurrentAlbum && currentTrack && (
        <div className="fixed bottom-20 left-0 right-0 z-30 bg-bg-secondary/95 backdrop-blur-sm border-t border-white/5 px-4 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0"><SeekBar currentTime={currentTime} duration={duration} onSeek={seek} /></div>
          <VolumeControl volume={volume} onSetVolume={() => {}} />
        </div>
      )}
    </div>
  );
}
