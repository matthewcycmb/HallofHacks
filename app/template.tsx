/**
 * Re-mounts on every navigation, so `.page-in` (an opacity fade — safe for the
 * fixed onboarding/signup overlays) plays as a smooth between-page transition.
 * The flex classes mirror the old page slot so the feed's layout is unchanged.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in flex min-h-0 w-full flex-1 flex-col">{children}</div>;
}
