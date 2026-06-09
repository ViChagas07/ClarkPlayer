import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ClarkPlayer — Your Music, Your Way",
    template: "%s — ClarkPlayer",
  },
  description:
    "A sleek, powerful media player for all your music. Stream, organize, and enjoy your library with ClarkPlayer.",
  keywords: [
    "music player",
    "media player",
    "audio player",
    "lossless audio",
    "playlist manager",
  ],
  openGraph: {
    title: "ClarkPlayer",
    description: "A sleek, powerful media player for all your music.",
    type: "website",
    url: "https://clarkplayer.app",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ClarkPlayer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClarkPlayer",
    description: "A sleek, powerful media player for all your music.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  metadataBase: new URL("https://clarkplayer.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${nunitoSans.variable}`}>
      <body className="min-h-screen bg-bg-primary text-body font-sans antialiased">
        <AppShell>{children}</AppShell>

        {/* Live region for screen reader announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" />
      </body>
    </html>
  );
}
