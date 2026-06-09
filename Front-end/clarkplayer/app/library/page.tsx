import type { Metadata } from "next";
import LibraryClient from "./LibraryClient";

export const metadata: Metadata = {
  title: "Library — ClarkPlayer",
  description: "Browse your music library — albums, tracks, artists, and playlists.",
};

export default function LibraryPage() {
  return <LibraryClient />;
}
