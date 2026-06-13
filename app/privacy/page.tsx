import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Hall of Hacks handles your data.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-[680px] px-[clamp(20px,4vw,48px)] pb-[140px] pt-10 leading-relaxed">
      <h1 className="text-[28px] font-bold tracking-[-0.015em]">Privacy Policy</h1>
      <p className="mt-1 text-sm text-ink-soft">Last updated June 12, 2026</p>

      <div className="mt-8 flex flex-col gap-6 text-[15px] text-ink-soft [&_h2]:text-[17px] [&_h2]:font-bold [&_h2]:text-ink [&_a]:text-gold [&_a]:underline">
        <p>
          Hall of Hacks (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a curated archive of
          prize-winning hackathon projects. This policy explains what we collect when you
          create an account and how we use it. We keep it minimal on purpose.
        </p>

        <section className="flex flex-col gap-2">
          <h2>What we collect</h2>
          <p>
            When you sign in with Google or GitHub, we receive your name, email address, and
            profile image from that provider. We also store the projects you save and any
            collections you create. We do not collect payment information, and the service is
            free.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>How we use it</h2>
          <p>
            Your name, email, and image identify your account and personalize the header.
            Your saved collections are stored so they sync across your devices. We do not sell
            your data or use it for advertising.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Where it&rsquo;s stored and who processes it</h2>
          <p>
            Account and collection data are stored in a managed PostgreSQL database (Neon).
            The site is hosted on Vercel. Sign-in is handled via Google and GitHub OAuth.
            These providers process data on our behalf under their own privacy terms.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Cookies</h2>
          <p>
            We use a single, secure, http-only session cookie to keep you signed in. We do
            not use third-party tracking or advertising cookies.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Your choices</h2>
          <p>
            You can sign out at any time, and you can delete your account, which permanently
            removes your profile and all your collections. To request deletion or a copy of
            your data, contact us at the address below.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a href="mailto:jchanh@gmail.com">jchanh@gmail.com</a>.
          </p>
        </section>
      </div>
    </article>
  );
}
