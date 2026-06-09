import type { Metadata } from "next";
import SignUpClient from "./SignUpClient";

export const metadata: Metadata = {
  title: "Create Account — ClarkPlayer",
  description: "Create your ClarkPlayer account and start your music library.",
};

export default function SignUpPage() {
  return <SignUpClient />;
}
