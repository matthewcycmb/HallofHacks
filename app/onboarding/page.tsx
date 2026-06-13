import { redirect } from "next/navigation";

/** Onboarding moved to the root (/). Keep this path working for old links. */
export default function OnboardingRedirect() {
  redirect("/");
}
