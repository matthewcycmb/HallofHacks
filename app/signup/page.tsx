import type { Metadata } from "next";
import { Suspense } from "react";
import SignupCard from "@/components/handoff/SignupCard";
import { MEMBER_FLAG_KEY } from "@/lib/auth/member-flag";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Hall of Hacks with Google or GitHub. Free forever.",
};

export default function SignupPage() {
  // Suspense boundary: SignupCard reads useSearchParams (?next / ?error),
  // which keeps this page statically prerenderable under Next 16.
  return (
    <>
      {/*
        Returning members skip the sign-in card. Runs before it paints, so no
        flash. Honors a same-origin `?next` (default /feed); the safe-path check
        matches safeNext() in SignupCard. useSession there is the backstop.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem(${JSON.stringify(
            MEMBER_FLAG_KEY,
          )})){var n=new URLSearchParams(location.search).get('next');var ok=n&&n.charAt(0)==='/'&&n.charAt(1)!=='/'&&n.charAt(1)!=='\\\\';location.replace(ok?n:'/feed')}}catch(e){}`,
        }}
      />
      <Suspense fallback={null}>
        <SignupCard />
      </Suspense>
    </>
  );
}
