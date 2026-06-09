import type { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings — ClarkPlayer",
  description: "Configure your ClarkPlayer experience — playback, library, and appearance settings.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
