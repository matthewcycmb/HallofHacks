import type { DefaultSession } from "next-auth";

// Surface the user id we inject in the jwt/session callbacks (auth.ts).
declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
