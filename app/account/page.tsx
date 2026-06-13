"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useCollections } from "@/lib/collections";
import { deleteAccountAction } from "@/lib/collections/actions";
import { useHydrated } from "@/lib/use-hydrated";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const { collections } = useCollections();
  const hydrated = useHydrated();
  const [busy, setBusy] = useState(false);

  if (!hydrated || status === "loading") return null;

  if (status !== "authenticated" || !session?.user) {
    return (
      <div className="mx-auto w-full max-w-[680px] px-[clamp(20px,4vw,48px)] pb-[140px] pt-10">
        <h1 className="text-[26px] font-bold tracking-[-0.01em]">Account</h1>
        <p className="mt-2 text-sm text-ink-soft">
          You&rsquo;re signed out.{" "}
          <Link href="/signup?next=/account" className="text-gold underline underline-offset-2">
            Sign in
          </Link>{" "}
          to manage your account.
        </p>
      </div>
    );
  }

  const { name, email } = session.user;

  function downloadData() {
    const payload = {
      account: { name, email },
      collections,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hall-of-hacks-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    if (!window.confirm("Delete your account and all collections? This can't be undone.")) return;
    setBusy(true);
    const res = await deleteAccountAction();
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      setBusy(false);
      window.alert("Couldn't delete the account. Please try again.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[680px] px-[clamp(20px,4vw,48px)] pb-[140px] pt-10">
      <h1 className="text-[26px] font-bold tracking-[-0.01em]">Account</h1>
      <p className="mt-1 text-sm text-ink-soft">Manage your account and data.</p>

      <div className="mt-6 rounded-2xl border border-line bg-paper-2 px-5 py-4">
        {name && <p className="text-[15px] font-bold">{name}</p>}
        {email && <p className="text-sm text-ink-soft">{email}</p>}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <h2 className="text-[15px] font-bold">Your data</h2>
        <p className="text-sm text-ink-soft">
          Download everything we store about you — your profile and saved collections.
        </p>
        <button
          type="button"
          onClick={downloadData}
          className="self-start rounded-full border border-line bg-paper px-4 py-2 text-[13px] font-bold transition-colors hover:bg-paper-2"
        >
          Download my data
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="text-[15px] font-bold text-red-300">Danger zone</h2>
        <p className="text-sm text-ink-soft">
          Permanently delete your account, your collections, and everything we store. This
          cannot be undone.
        </p>
        <button
          type="button"
          onClick={deleteAccount}
          disabled={busy}
          className="self-start rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-[13px] font-bold text-red-200 transition-colors hover:bg-red-500/20 disabled:opacity-50"
        >
          {busy ? "Deleting…" : "Delete account"}
        </button>
      </div>
    </div>
  );
}
