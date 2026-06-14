import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Hall of Hacks handles your data.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-[680px] px-[clamp(20px,4vw,48px)] pb-[140px] pt-10 leading-relaxed">
      <h1 className="text-[28px] font-bold tracking-[-0.015em]">Privacy Policy</h1>
      <p className="mt-1 text-sm text-ink-soft">Last updated June 13, 2026</p>

      <div className="mt-8 flex flex-col gap-6 text-[15px] text-ink-soft [&_h2]:text-[17px] [&_h2]:font-bold [&_h2]:text-ink [&_a]:text-gold [&_a]:underline">
        <p>
          Hall of Hacks (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a curated archive of
          prize-winning hackathon projects. This policy covers two things: the public
          information we keep about featured projects and their creators, and the account
          information we collect when you sign in. We keep both minimal on purpose.
        </p>

        <section className="flex flex-col gap-2">
          <h2>Information about featured projects and their creators</h2>
          <p>
            The archive contains information about hackathon projects &mdash; project names,
            descriptions, the prizes won, event names and years, representative images, and the
            names and public profile links of team members as they were publicly credited. This
            information is collected from publicly accessible sources, primarily project pages
            on Devpost, and from the platforms that host the linked demos and code.
          </p>
          <p>
            We publish it to document and celebrate winning work and to help newcomers learn,
            and we rely on our legitimate interest in maintaining this public-interest,
            educational archive as the basis for doing so. We do not add private contact
            details, and we do not track or profile the people featured. If you are featured and
            would like your name, image, or project removed, email{" "}
            <a href="mailto:matthewashere0@gmail.com?subject=Hall%20of%20Hacks%20removal%20request">
              matthewashere0@gmail.com
            </a>{" "}
            and we&rsquo;ll remove it promptly &mdash; you don&rsquo;t need to give a reason.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Account information we collect</h2>
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
          <h2>Your choices and rights</h2>
          <p>
            You can sign out at any time, and you can delete your account, which permanently
            removes your profile and all your collections. If you&rsquo;re a featured creator,
            you can ask us to remove your personal information from the archive as described
            above. To request access to, a copy of, or deletion of your data, contact us at the
            address below and we&rsquo;ll act on reasonable requests.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a href="mailto:matthewashere0@gmail.com">matthewashere0@gmail.com</a>.
          </p>
        </section>
      </div>
    </article>
  );
}
