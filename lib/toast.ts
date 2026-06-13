export const TOAST_EVENT = "hoh:toast";

/** Fire a transient toast (rendered by components/Toaster). Safe to call from any client code. */
export function toast(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message } }));
}
