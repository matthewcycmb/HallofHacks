import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using Hall of Hacks.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-[680px] px-[clamp(20px,4vw,48px)] pb-[140px] pt-10 leading-relaxed">
      <h1 className="text-[28px] font-bold tracking-[-0.015em]">Terms of Service</h1>
      <p className="mt-1 text-sm text-ink-soft">Last updated June 12, 2026</p>

      <div className="mt-8 flex flex-col gap-6 text-[15px] text-ink-soft [&_h2]:text-[17px] [&_h2]:font-bold [&_h2]:text-ink [&_a]:text-gold [&_a]:underline">
        <p>
          By using Hall of Hacks you agree to these terms. If you don&rsquo;t agree, please
          don&rsquo;t use the service.
        </p>

        <section className="flex flex-col gap-2">
          <h2>The service</h2>
          <p>
            Hall of Hacks is a free, curated archive of prize-winning hackathon projects. We
            link to external sources such as Devpost, GitHub, and YouTube. We don&rsquo;t own
            those projects; the work and any trademarks belong to their respective creators.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Your account</h2>
          <p>
            You can create an account using Google or GitHub to save and sync collections.
            You&rsquo;re responsible for activity under your account. You may delete your
            account at any time.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Acceptable use</h2>
          <p>
            Don&rsquo;t attempt to disrupt the service, access it through automated abuse, or
            use it to break the law. We may suspend access that does.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Content and accuracy</h2>
          <p>
            We curate listings carefully but make no guarantee that every detail is accurate
            or current. If you&rsquo;re a project creator and want a listing changed or
            removed, contact us.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Disclaimer and liability</h2>
          <p>
            The service is provided &ldquo;as is&rdquo; without warranties of any kind. To the
            extent permitted by law, we aren&rsquo;t liable for any damages arising from your
            use of the service.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Changes</h2>
          <p>
            We may update these terms. Continued use after changes means you accept the
            updated terms.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Contact</h2>
          <p>
            Questions? Email <a href="mailto:jchanh@gmail.com">jchanh@gmail.com</a>.
          </p>
        </section>
      </div>
    </article>
  );
}
