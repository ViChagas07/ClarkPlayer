import type { Metadata } from "next";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Search — ClarkPlayer",
  description: "Search your music library — tracks, albums, artists, and playlists.",
};

export default function SearchPage() {
  return <SearchClient />;
}
