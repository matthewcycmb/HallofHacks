import type { Metadata } from "next";
import { Suspense } from "react";
import SignupCard from "@/components/handoff/SignupCard";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Hall of Hacks with Google or GitHub. Free forever.",
};

export default function SignupPage() {
  // Suspense boundary: SignupCard reads useSearchParams (?next / ?error),
  // which keeps this page statically prerenderable under Next 16.
  return (
    <Suspense fallback={null}>
      <SignupCard />
    </Suspense>
  );
}
