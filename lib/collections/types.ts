/** Shared collection shape — imported by both the client store and server actions. */
export interface Collection {
  id: string;
  name: string;
  slugs: string[];
  createdAt: number;
}

export type CollectionsResult =
  | { collections: Collection[] }
  | { error: "UNAUTHENTICATED" | "NOT_FOUND" };
