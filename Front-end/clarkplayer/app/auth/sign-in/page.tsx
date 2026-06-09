import type { Metadata } from "next";
import SignInClient from "./SignInClient";

export const metadata: Metadata = {
  title: "Sign In — ClarkPlayer",
  description: "Sign in to your ClarkPlayer account.",
};

export default function SignInPage() {
  return <SignInClient />;
}
