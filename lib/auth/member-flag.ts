/**
 * localStorage flag marking a signed-in member ON THIS DEVICE. Set on sign-in
 * and cleared on sign-out (see CollectionsBridge + AccountWidget). It lets the
 * static (SSG) home page skip the onboarding marketing for returning members
 * without going dynamic: a pre-paint inline script on `/` reads it and bounces
 * to `/feed` before onboarding paints. useSession in OnboardingFlow is the
 * authoritative backstop when localStorage is unavailable (Safari private mode).
 */
export const MEMBER_FLAG_KEY = "hall-of-hacks:v1:member";
