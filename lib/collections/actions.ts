"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { collections, collectionItems } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/dal";
import { getPostHogClient } from "@/lib/posthog-server";
import type { Collection, CollectionsResult } from "./types";

// Project slugs are kebab-case. Reject anything else so a direct POST can't
// write arbitrary strings into collection_item.slug.
const SLUG_RE = /^[a-z0-9-]{1,120}$/;
const isValidSlug = (s: unknown): s is string => typeof s === "string" && SLUG_RE.test(s);

// Migration is the only caller-supplied bulk write — bound it hard.
const MAX_MIGRATE_COLLECTIONS = 50;
const MAX_SLUGS_PER_COLLECTION = 1000;

/**
 * Server-owned collections. Every action resolves the session first and scopes
 * ALL queries by the user's id — these are reachable by direct POST, so the
 * auth check lives in each one (not just the UI). Each returns the authoritative
 * collection list so the client can replace its snapshot.
 */

async function listCollections(userId: string): Promise<Collection[]> {
  const cols = await db
    .select()
    .from(collections)
    .where(eq(collections.userId, userId))
    .orderBy(collections.sortOrder, collections.createdAt);

  if (cols.length === 0) return [];

  const items = await db
    .select()
    .from(collectionItems)
    .where(
      inArray(
        collectionItems.collectionId,
        cols.map((c) => c.id),
      ),
    );

  return cols.map((c) => ({
    id: c.id,
    name: c.name,
    slugs: items.filter((i) => i.collectionId === c.id).map((i) => i.slug),
    createdAt: c.createdAt.getTime(),
  }));
}

async function ensureDefault(userId: string) {
  const existing = await db
    .select()
    .from(collections)
    .where(and(eq(collections.userId, userId), eq(collections.isDefault, true)))
    .limit(1);
  if (existing[0]) return existing[0];
  const [created] = await db
    .insert(collections)
    .values({ userId, name: "Saved", isDefault: true, sortOrder: 0 })
    .returning();
  return created;
}

export async function getCollections(): Promise<CollectionsResult> {
  const userId = await getUserId();
  if (!userId) return { error: "UNAUTHENTICATED" };
  return { collections: await listCollections(userId) };
}

/** Toggle a slug in the user's default "Saved" collection. */
export async function quickSaveToggleAction(slug: string): Promise<CollectionsResult> {
  const userId = await getUserId();
  if (!userId) return { error: "UNAUTHENTICATED" };
  if (!isValidSlug(slug)) return { error: "NOT_FOUND" };

  const def = await ensureDefault(userId);
  const existing = await db
    .select()
    .from(collectionItems)
    .where(and(eq(collectionItems.collectionId, def.id), eq(collectionItems.slug, slug)))
    .limit(1);

  const action = existing[0] ? "unsave" : "save";
  if (existing[0]) {
    await db
      .delete(collectionItems)
      .where(and(eq(collectionItems.collectionId, def.id), eq(collectionItems.slug, slug)));
  } else {
    await db.insert(collectionItems).values({ collectionId: def.id, slug }).onConflictDoNothing();
  }

  const ph = getPostHogClient();
  ph.capture({ distinctId: userId, event: "project_saved", properties: { slug, action } });

  return { collections: await listCollections(userId) };
}

export async function createCollectionAction(name: string): Promise<CollectionsResult> {
  const userId = await getUserId();
  if (!userId) return { error: "UNAUTHENTICATED" };
  const clean = name.trim().slice(0, 60) || "Untitled";
  await db.insert(collections).values({ userId, name: clean });
  const ph = getPostHogClient();
  ph.capture({ distinctId: userId, event: "collection_created" });
  return { collections: await listCollections(userId) };
}

/** Create a new collection and add a slug to it in one round-trip (SaveMenu). */
export async function createCollectionWithSlugAction(
  name: string,
  slug: string,
): Promise<CollectionsResult> {
  const userId = await getUserId();
  if (!userId) return { error: "UNAUTHENTICATED" };
  if (!isValidSlug(slug)) return { error: "NOT_FOUND" };
  const clean = name.trim().slice(0, 60) || "Untitled";
  const [created] = await db.insert(collections).values({ userId, name: clean }).returning();
  await db.insert(collectionItems).values({ collectionId: created.id, slug }).onConflictDoNothing();
  return { collections: await listCollections(userId) };
}

export async function deleteCollectionAction(id: string): Promise<CollectionsResult> {
  const userId = await getUserId();
  if (!userId) return { error: "UNAUTHENTICATED" };
  // Scoped by userId so a user can only delete their own. Items cascade.
  await db.delete(collections).where(and(eq(collections.id, id), eq(collections.userId, userId)));
  return { collections: await listCollections(userId) };
}

/** Toggle a slug in a specific (owned) collection. */
export async function toggleItemAction(
  collectionId: string,
  slug: string,
): Promise<CollectionsResult> {
  const userId = await getUserId();
  if (!userId) return { error: "UNAUTHENTICATED" };
  if (!isValidSlug(slug)) return { error: "NOT_FOUND" };

  const owned = await db
    .select({ id: collections.id })
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.userId, userId)))
    .limit(1);
  if (!owned[0]) return { error: "NOT_FOUND" };

  const existing = await db
    .select()
    .from(collectionItems)
    .where(and(eq(collectionItems.collectionId, collectionId), eq(collectionItems.slug, slug)))
    .limit(1);

  if (existing[0]) {
    await db
      .delete(collectionItems)
      .where(and(eq(collectionItems.collectionId, collectionId), eq(collectionItems.slug, slug)));
  } else {
    await db
      .insert(collectionItems)
      .values({ collectionId, slug })
      .onConflictDoNothing();
  }

  return { collections: await listCollections(userId) };
}

/**
 * One-time merge of pre-account localStorage collections into the account.
 * Idempotent: "Saved"/default folds into the user's default collection, named
 * folders match by name (or are created), slugs union via ON CONFLICT DO NOTHING.
 */
export async function migrateCollectionsAction(local: Collection[]): Promise<CollectionsResult> {
  const userId = await getUserId();
  if (!userId) return { error: "UNAUTHENTICATED" };

  // Caller-supplied payload: cap collections, validate + cap slugs per collection.
  const incoming = Array.isArray(local) ? local.slice(0, MAX_MIGRATE_COLLECTIONS) : [];

  for (const lc of incoming) {
    const name = typeof lc?.name === "string" ? lc.name.trim() : "";
    const slugs = (Array.isArray(lc?.slugs) ? lc.slugs : [])
      .filter(isValidSlug)
      .slice(0, MAX_SLUGS_PER_COLLECTION);
    if (slugs.length === 0) continue;

    let targetId: string;
    if (name.toLowerCase() === "saved") {
      targetId = (await ensureDefault(userId)).id;
    } else {
      const found = await db
        .select({ id: collections.id })
        .from(collections)
        .where(and(eq(collections.userId, userId), eq(collections.name, name)))
        .limit(1);
      targetId =
        found[0]?.id ??
        (
          await db
            .insert(collections)
            .values({ userId, name: name.slice(0, 60) || "Untitled" })
            .returning()
        )[0].id;
    }

    await db
      .insert(collectionItems)
      .values(slugs.map((slug) => ({ collectionId: targetId, slug })))
      .onConflictDoNothing();
  }

  return { collections: await listCollections(userId) };
}

/** Permanently delete the account and all its data (cascades). */
export async function deleteAccountAction(): Promise<{ ok: boolean }> {
  const userId = await getUserId();
  if (!userId) return { ok: false };
  const { users } = await import("@/lib/db/schema");
  await db.delete(users).where(eq(users.id, userId));
  return { ok: true };
}
