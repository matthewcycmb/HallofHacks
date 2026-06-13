"use client";

import { SessionProvider } from "next-auth/react";
import CollectionsBridge from "./CollectionsBridge";

/**
 * Client session context. No `session` prop on purpose — the provider fetches
 * `/api/auth/session` after hydration, so the server HTML stays identical for
 * everyone and the archive pages remain static (SSG). Only the header account
 * widget hydrates in afterward. CollectionsBridge wires the store to the session.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CollectionsBridge />
      {children}
    </SessionProvider>
  );
}
