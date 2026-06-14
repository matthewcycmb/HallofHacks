import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using Hall of Hacks.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-[680px] px-[clamp(20px,4vw,48px)] pb-[140px] pt-10 leading-relaxed">
      <h1 className="text-[28px] font-bold tracking-[-0.015em]">Terms of Service</h1>
      <p className="mt-1 text-sm text-ink-soft">Last updated June 13, 2026</p>

      <div className="mt-8 flex flex-col gap-6 text-[15px] text-ink-soft [&_h2]:text-[17px] [&_h2]:font-bold [&_h2]:text-ink [&_a]:text-gold [&_a]:underline">
        <p>
          By using Hall of Hacks you agree to these terms. If you don&rsquo;t agree, please
          don&rsquo;t use the service.
        </p>

        <section className="flex flex-col gap-2">
          <h2>The service</h2>
          <p>
            Hall of Hacks is a free, non-commercial, editorially curated archive of
            prize-winning hackathon projects. For each project we publish a short factual
            summary and link out to the original public sources, such as the team&rsquo;s
            Devpost page, GitHub repository, and demo video. The information is gathered from
            publicly accessible pages and is presented for informational, educational, and
            commentary purposes &mdash; to help newcomers learn from work that won.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Featured projects and intellectual property</h2>
          <p>
            The hackathon projects featured here were created by other people and teams, and
            the underlying work belongs to them. For each listing we show limited factual
            details &mdash; the project name, the prize it won, the event and year, a brief
            description, the team members&rsquo; names as they were publicly credited, and a
            representative image or thumbnail &mdash; alongside links to the creators&rsquo;
            own pages.
          </p>
          <p>
            We don&rsquo;t claim ownership of any featured project, and Hall of Hacks is not
            affiliated with, sponsored by, or endorsed by the projects&rsquo; creators, the
            hackathons, their organizers or sponsors, Devpost, GitHub, or YouTube. Project,
            company, event, and product names and logos are the trademarks of their respective
            owners and are used here only to identify and describe the work. Any embedded
            video or linked page is served by its original platform under that platform&rsquo;s
            own terms.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Removal, corrections, and copyright</h2>
          <p>
            If you are a project creator, team member, event organizer, or rights holder and
            you&rsquo;d like a listing corrected, your name or image removed, or your project
            taken down, email{" "}
            <a href="mailto:jchanh@gmail.com?subject=Hall%20of%20Hacks%20removal%20request">
              jchanh@gmail.com
            </a>{" "}
            and we will honor reasonable requests promptly, normally within a few days. You
            don&rsquo;t need to give a reason to have your own project or personal information
            removed.
          </p>
          <p>
            If you believe content on this site infringes your copyright, send the same address
            a note identifying the work, the URL of the listing here, your contact information,
            and a statement that you are the rights holder or authorized to act for them, and
            we will remove or disable the material in question.
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
          <h2>Accuracy</h2>
          <p>
            We curate listings carefully but make no guarantee that every detail is accurate,
            complete, or current. Nothing here is an official record of any event or result.
            If you spot something wrong, let us know and we&rsquo;ll fix or remove it.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Disclaimer and liability</h2>
          <p>
            The service and all listings are provided &ldquo;as is&rdquo; and &ldquo;as
            available,&rdquo; without warranties of any kind, express or implied, including
            accuracy, completeness, or fitness for a particular purpose. Hall of Hacks is run
            by an individual as a non-commercial passion project, and we are not responsible
            for content on the third-party sites we link to or embed. To the maximum extent
            permitted by law, we will not be liable for any indirect, incidental, or
            consequential damages, or for any loss arising from your use of (or inability to
            use) the service or your reliance on any listing. You use the service at your own
            risk.
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
