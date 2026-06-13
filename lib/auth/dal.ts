import "server-only";
import { cache } from "react";
import { auth } from "@/auth";

/**
 * Data Access Layer — the single place server code asks "who is this?".
 * `cache()` memoizes within a render/request so multiple callers share one
 * session read. We guard here instead of in middleware/proxy (Next 16 renamed
 * middleware to proxy.ts; its auth guide says proxy should only do optimistic
 * cookie reads — real checks belong in the DAL).
 */
export const verifySession = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
});

/** Returns the signed-in user's id, or null. Use at the top of server actions. */
export async function getUserId(): Promise<string | null> {
  const session = await verifySession();
  return session?.user?.id ?? null;
}
