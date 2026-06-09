import type { Metadata } from "next";
import AlbumClient from "./AlbumClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const album = { name: "Midnight Echoes", artist: "Lena Ray", trackCount: 12, duration: 2820 };
  return {
    title: `${album.name} by ${album.artist} — ClarkPlayer`,
    description: `Listen to ${album.name} by ${album.artist} on ClarkPlayer. ${album.trackCount} tracks, ${Math.floor(album.duration / 60)}:${String(album.duration % 60).padStart(2, "0")}.`,
    openGraph: {
      title: `${album.name} — ${album.artist}`,
      description: `Listen to ${album.name} on ClarkPlayer.`,
      type: "music.album",
    },
  };
}

export default async function AlbumDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AlbumClient id={id} />;
}
