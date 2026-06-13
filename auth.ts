import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db/client";

/**
 * Auth.js v5 core. JWT sessions (no per-request DB hit); the adapter persists
 * users/accounts at sign-in so collections have a stable owner id.
 *
 * No schema arg to DrizzleAdapter on purpose: our lib/db/schema.ts table and
 * column names mirror the adapter's internal defaults exactly, so it queries
 * the right tables. `session`/`authenticator` defaults go unused under JWT.
 *
 * `allowDangerousEmailAccountLinking`: both Google and GitHub verify email, so
 * one person signing in with either provider resolves to a single account.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  pages: { signIn: "/signup" },
  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),
    GitHub({ allowDangerousEmailAccountLinking: true }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` is present only on sign-in; carry its id on the token thereafter.
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
